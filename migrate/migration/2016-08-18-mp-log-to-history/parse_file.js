/**
 * @fileoverview Manager Planner does not log histories but it does create logs with useful info.  
 * This script parses the logs and creates histories.
 */

var utils = require('dsp_shared/lib/cmd_utils');
utils.connect(['meteor', 'trans', 'postgres']);
var moment = require('moment');
var stream_gen = require('dsp_shared/lib/stream_gen');
var fs = require('fs');
var _ = require('underscore');
var es = require('event-stream');
var stripAnsi = require('strip-ansi');
var assert = require('assert');

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

/**
 * Class LineParser: Parses a log line differet ways
 * @param {String} line a line from the file
 */
function LineParser(line) {
  this.raw_line = line;
  this.line = stripAnsi(line);
  this.parseDate();
}

/**
 * parseDate Splits the line into date and content
 */
LineParser.prototype.parseDate = function() {
  var line_prefix = "I20160706-14:50:20.356(0)? ";
  var date_prefix = "I20160706-14:50:20.356(0)"; 

  this.date = this.line.slice(0, date_prefix.length);
  // console.log("DATE", this)
  assert(this.date.endsWith('(0)'));//date parsing is assuming UTC time (0)
  
  this.date =  moment(this.date.slice(0, -3)+"Z", "IYYYYMMDD-HH:mm:ss:SSSZ").toDate();
  this.content = this.line.slice(line_prefix.length).trim();
  return this;
};

/**
 * split this function splits the line content and allows you to name each value.  It takes a variable argument array
 * @param {String} delimiter string to split on.
 * @param {String} first_label label of the first item split from the content
 * @param {String} second_label label of the second item split from the content
 * @param {String} nth_label label of the nth item split from the content
 */
LineParser.prototype.split = function(delimiter) {
  this.content = this.content.split(delimiter);
  for(var i = 0; i < this.content.length; i++) {
    if(arguments[i+1]) {      
      this[arguments[i+1]] = this.content[i];
    } else {
      this[arguments[arguments.length-1]] += delimiter+ this.content[i];
    }
  }
  
  for(i = 0; i < this.content.length; i++) {
    this.content[i] = this.content[i].trim();
    if(arguments[i+1]) {
      this[arguments[i+1]] = this[arguments[i+1]].trim();
    }
  }
  return this;
};







function ParserBackupError(message, push_back_lines) {
    this.name = "ParserBackupError";
    this.message = (message || "");
    this.push_back_lines = push_back_lines;
}
ParserBackupError.prototype = Error.prototype;




var skipable_lines = ["Fetching batch", "Cufs published", "Divisions published", "Pmds published",
"(STDERR) Trying to assign already assgined trees.", "generateTileCache", "ADMIN Cufs",
"Drilldown Published", "Exception while ", "at ", "- - - - -", "Exception from sub divisions",
"source: 'subscription", "Testing - createTileDir", "testGenerateTileCache"];
function isSkipable(line) {
  for(var i = 0; i < skipable_lines.length; i++) {
    var prefix = skipable_lines[i];
    if(line.content.startsWith(prefix)) {
      return true;
    }
  }
  return false;
}
// var not_skipable_lines = ["TREES Assign", "TREES Unassign", "TREES Push", "TREE EDIT", "Update Routine",
// "Assignee ID", "Assignee EMAIL", "Assigned Trees ID", "Unassignee ID", "Unassignee EMAIL", "Unassigned Trees ID",
// "Pushee ID", "Pushee EMAIL", "Pushed Trees ID", "'", "USER ID", "USER EMAIL", "Status:", "Tree ID"
// // "   { _str: ", "Update Routine Value for"
// ];
// function isSkipable(line) {
//
//   for(var i = 0; i < not_skipable_lines.length; i++) {
//     var prefix = not_skipable_lines[i];
//     if(line.content.startsWith(prefix)) {
//       return false;
//     }
//   }
//   return true;
// }



var parser_types = {
  "TREES Assign": 'assign',
  "TREES Unassign": 'unassign',
  "TREES Push": 'push',
  "TREE EDIT": 'edit',
  "Update Routine": 'routine'
};

var parsers = {
  "assign": PushAssignParser,
  "unassign": PushAssignParser,
  "push": PushAssignParser,
  "edit": EditParser,
  // "routine": parseRoutine
};




function getParser(line) {
  var type = getParserType(line);
  if(parsers[type]) {
    return new parsers[type]();
  }
  return null;  
}

function getParserType(line) {
  for(var starter in parser_types) {        
    if(line.content.startsWith(starter)) {
      return parser_types[starter];
    }
  }
  return null;  
}
// function isStarterLine(line) {
//   return getParserType(line) !== null;
// }


function PushBackStreamer(file_path) {
  var s = fs.createReadStream(file_path).pipe(es.split());
  this.saved = [];
  this.readable = [];
  var _this = this;
  function *lines_gen(){
    var lines = stream_gen(s);
    while(true) {
      if(_this.readable.length > 0) {
        var raw_line = _this.readable.shift();
        // console.log("READING BACK LINE", raw_line);
        yield Promise.resolve(raw_line);
      } else {
        var line = lines.next();
        if(!line.done) {
          yield line.value;
        } else {
          return;
        }
      } 
    }
  }
  this.gen = lines_gen();
} 

PushBackStreamer.prototype.pushBackLine = function(line){
  this.saved.push(line);
  // console.warn("PUSHING BACK LINE",this.saved.length, line);
};
PushBackStreamer.prototype.readBackLines = function() {
  if(this.saved.length > 0) {
    var ordered = this.saved.slice(0).sort();
    if(this.read_back) {
      var is_same = (this.read_back.length === ordered.length) && this.read_back.every(function(element, index) {
          return element === ordered[index]; 
      });
      if(is_same) {
        throw new Error('Reading back same lines a second time.');
      }
    }
    this.readable = ordered;
    
    this.readable = this.saved;    
    this.saved = [];
    console.info('Read back lines', this.readable.length);
    console.info('Read back lines', this.readable);
  }
};






function *process_file(file_path) {
  console.log("RUNNING", file_path);
  var lines = new PushBackStreamer(file_path);
  var parsed_results = [];
  
  var parsers = [];
  for(var line of lines.gen) {
    line = yield line;
    if(line) {
      var line_consumed = false;
      line = stripAnsi(line);
      if(line.startsWith("I201")) {
        line = new LineParser(line);
        var parser = getParser(line);
        
        if(parser) {          
          parsers.push(parser);
        }
        if(!isSkipable(line)) {
          
          for(var i = 0; i < parsers.length; i++) {
            parser = parsers[i];
            line_consumed = parser.addLine(line);
            // console.log("TEST LINE", line.raw_line, line_consumed, parser.result.type);
            if(line_consumed) {
              if(parser.result_ready) {              
                parsed_results.push(parser.result);
                parsers.splice(i, 1);
              }                        
              break;
            }
            //  else {
            //   console.log("Skipping", line);
            // }
          }
          // console.log("LINE", line.content, line_consumed, i);
          if(!line_consumed && parsers.length > 0) {    
            if(parsers.length > 2) {
              console.log('Bad logging: ', line.raw_line, line_consumed);
              throw new Error("Trying to parse more than two events at a time.  Parser logic is not work for this situation.");
            }
                    
            console.log("LINE OUT OF ORDER");
            //Found a line that was out of order.  Let's try to parse them in a different order.
          
            while(parsers.length > 0) {
              parser = parsers.pop();
              // console.log("LINES", parser.lines);
              for(var j = 0; j < parser.lines.length; j++) {
                lines.pushBackLine(parser.lines[j].raw_line);
              }
            }
            lines.pushBackLine(line.raw_line);
            lines.readBackLines();
            // throw new Error("Unhandleable line");
          }
        }
      }
    }
  }
  console.log("PROCESSED");
  return parsed_results;
}


function Parser() {  
  this.gens = null;
  this.result = {};
  this.lines = [];
  this.result_ready = false;
}
Parser.prototype.addLine = function(line) {
  if(!this.gen) {
    this.gen = this.parserGen(line);
  }
  
  var line_consumed = this.gen.next(line);
  if(line_consumed.done) {
    this.result_ready = true;
  }
  return line_consumed.value;
};

Parser.prototype.consumeValue = function(line, label, field_name) {
  if(line.content.startsWith(label)) {
    this.lines = this.lines || [];
    this.lines.push(line);
    line.split(":", "label", field_name);
    assert(line.label === label);
    this.result[field_name] = line[field_name];
    return {values_consumed: true, line_consumed: true};
  } 
  return  {values_consumed: false, line_consumed: false};
};  

/**
 * @function findArray - parses a multi line array 
 * @param {Generator} lines co generator of lines
 * @param {String} label the expected label for the line
 * @param {String} field_name the name of the array field in teh result
 * @param {String} first_line if the frist line has already been read pass it in here
 * @param {Boolean} wrap When parsing the array should I wrap the coma delimited elements with a quote.
 */
Parser.prototype.consumeArray = function(line, label, field_name, first_line, wrap) {
  wrap = wrap || false;
  this.lines = this.lines || [];
  // console.log("LINE", line);
  
  // if(first_line) {
  //   result.lines.push(first_line);
  //   first_line.split(":", "label", field_name);
  //   assert(first_line.label === label);
  //   result[field_name] = first_line[field_name];
  // } else {
    
  // }
  
  if(!this.result[field_name]) {
    this.consumeValue(line, label, field_name);
  } else {
    this.lines.push(line);
    this.result[field_name] += line.content; 
  }
  var arr = this.result[field_name];

  if(!arr.endsWith(']')) {
    return {line_consumed:true, values_consumed: false};
  } else {    
    if(wrap) {
      //wrap each element of array in quotes 
      arr = arr.replaceAll(",", '","');
      arr = arr.replaceAll('[[]', '["');
      arr = arr.replaceAll(']', '"]');

      arr = JSON.parse(arr);
      arr = _.map(arr, val=>val.trim());
      if(arr.length === 1 && arr[0] === "") {
        arr = [];
      }
      this.result[field_name] = arr;

    } else {
      arr = arr.replaceAll("'", '"');
      this.result[field_name] = JSON.parse(arr);
    }
    
    return {line_consumed:true, values_consumed: true};
  }
  
};  
 
 
Parser.prototype.parseValue = function(line, value_type, prefix, field_name) {
  var result;
  
  if(value_type === "value") {
    result = this.consumeValue(line, prefix, field_name);          
  } else if(value_type === "array") {
    result = this.consumeArray(line, prefix, field_name);
  }
  return result;
};
  
function PushAssignParser()  {
  Parser.call(this);
}
PushAssignParser.prototype = Object.create(Parser.prototype);
  
// I20160706-22:28:33.564(0)? TREES Assign/Unassign/Push
// I20160706-22:28:33.565(0)? USER ID:  YApnWLeCzCBTFpmth
// I20160706-22:28:33.566(0)? USER EMAIL:  elhj@pge.com
// I20160706-22:28:33.566(0)? Assignee/Unassignee/Pushee ID:  ff9dCbxMCrMsPLk9n
// I20160706-22:28:33.570(0)? Assignee/Unassignee/Pushee EMAIL:  pxwx@pge.com
// I20160706-22:28:33.570(0)? Assigned Trees ID/ Trees ID /Pushed Trees ID:  [ '567a8282d45c85303a37158c',
PushAssignParser.prototype.parserGen = function*(line) {

  var types = {
    "TREES Assign": "assign",
    "TREES Unassign": "unassign",
    "TREES Push": "push"
  };
  
  this.result.type =  types[line.content];
  this.result.date = line.date;
  this.lines.push(line);
  
  var labels = {
    assign: {target_user: "Assignee ID", target_email: "Assignee EMAIL", tree_ids: "Assigned Trees ID"},
    unassign: {target_user: "Unassignee ID", target_email: "Unassignee EMAIL", tree_ids: "Unassigned Trees ID"},
    push: {target_user: "Pushee ID", target_email: "Pushee EMAIL", tree_ids: "Pushed Trees ID"},
  };

  var values = [
    ['value', "USER ID", "user_id"],
    ['value', "USER EMAIL", "user_email"],
    ['value', labels[this.result.type].target_user, "target_id"],
    ['value', labels[this.result.type].target_email, "target_email"],
    ['array', labels[this.result.type].tree_ids, "tree_ids"]
  ];
  line = yield true;
  var i = 0;
  while(true) {
    
    var result = this.parseValue(line, values[i][0], values[i][1], values[i][2]);
    if(result.values_consumed) {
      i++;
    }
    
    if(i < values.length) {
      line = yield result.line_consumed;
    } else {
      return result.line_consumed;
    }
  }  
}; 



function EditParser()  {
  Parser.call(this);
}
EditParser.prototype = Object.create(Parser.prototype);
  
// I20160706-20:20:49.264(0)? TREE EDIT
// I20160706-20:20:49.265(0)? USER ID:  6HA8XRpemHsB8ej3K
// I20160706-20:20:49.265(0)? USER EMAIL:  mime@pge.com
// I20160706-20:20:49.265(0)? Tree ID:  56980abed9bfa5c61e093c57
// I20160706-20:20:49.266(0)? Status:  notready  -->  ready
/**
 * parseEdit - Parsing logs looking like above
 */
EditParser.prototype.parserGen = function*(line) {
  this.result.type = "edit";
  
  
  this.result.date = line.date;
  this.lines.push(line);
  line = yield true;
  
  var values = [
    ['value', "USER ID", "user_id"],
    ['value', "USER EMAIL", "user_email"],
    ['value', "Tree ID", "tree_id"],
    ['value', "Status", "to_from"],        
  ];
  
  var i = 0;
  while(true) {
    var result = this.parseValue(line, values[i][0], values[i][1], values[i][2]);    
    if(result.values_consumed) {
      i++;
    }
    
    if(i < values.length) {
      line = yield result.line_consumed;
    } else {
      this.result.to_from = this.result.to_from.split("-->");
      assert(this.result.to_from.length === 2);
      this.result.from = this.result.to_from[0].trim();
      this.result.to = this.result.to_from[1].trim();
      
      return result.line_consumed;
    }
  }  
};

// I20160706-20:44:06.177(0)? Update Routine Value for:  [ { _str: '56abad6b21186723291505cf' },
// I20160706-20:44:06.178(0)?   { _str: '56abad6b21186723291505d6' },
// I20160706-20:44:06.178(0)?   { _str: '56abad6b21186723291505d8' },
// I20160706-20:44:06.178(0)?   { _str: '56abad6b21186723291505da' },
// I20160706-20:44:06.179(0)?   { _str: '56abad6c21186723291505e3' },
// function *parseRoutine(lines, line) {
//   var result = {type: "routine_flag"};
//   console.log("READING", "Update Routine");
//   yield findArray(lines, "Update Routine Value for", "tree_ids", result, line, true);
//
//   //"{ _str: '56abad70211867232915062a' }"
//   result.tree_ids = _.map(result.tree_ids, tree_id => tree_id.slice(9, -3));
//   lines.readBackLines();
//   return result;
// }





module.exports = process_file;

if (require.main === module) {
  utils.bakerGen(process_file, {default: true});
  utils.bakerRun();  
}
