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

// I20160706-22:28:33.564(0)? TREES Assign/Unassign/Push
// I20160706-22:28:33.565(0)? USER ID:  YApnWLeCzCBTFpmth
// I20160706-22:28:33.566(0)? USER EMAIL:  elhj@pge.com
// I20160706-22:28:33.566(0)? Assignee/Unassignee/Pushee ID:  ff9dCbxMCrMsPLk9n
// I20160706-22:28:33.570(0)? Assignee/Unassignee/Pushee EMAIL:  pxwx@pge.com
// I20160706-22:28:33.570(0)? Assigned Trees ID/ Trees ID /Pushed Trees ID:  [ '567a8282d45c85303a37158c',
function *parsePushAssign(lines, line) {

  var types = {
    "TREES Assign": "assign",
    "TREES Unassign": "unassign",
    "TREES Push": "push"
  };
  
  var result = {type: types[line.content]};
  
  var labels = {
    assign: {target_user: "Assignee ID", target_email: "Assignee EMAIL", tree_ids: "Assigned Trees ID"},
    unassign: {target_user: "Unassignee ID", target_email: "Unassignee EMAIL", tree_ids: "Unassigned Trees ID"},
    push: {target_user: "Pushee ID", target_email: "Pushee EMAIL", tree_ids: "Pushed Trees ID"},
  };
  
  yield findValue(lines, "USER ID", "user_id", result);
  yield findValue(lines, "USER EMAIL", "user_email", result);
  yield findValue(lines, labels[result.type].target_user, "target_id", result);
  yield findValue(lines, labels[result.type].target_email, "target_email", result);
  yield findArray(lines, labels[result.type].tree_ids, "tree_ids", result);  
  return result;
} 

// I20160706-20:20:49.264(0)? TREE EDIT
// I20160706-20:20:49.265(0)? USER ID:  6HA8XRpemHsB8ej3K
// I20160706-20:20:49.265(0)? USER EMAIL:  mime@pge.com
// I20160706-20:20:49.265(0)? Tree ID:  56980abed9bfa5c61e093c57
// I20160706-20:20:49.266(0)? Status:  notready  -->  ready
/**
 * parseEdit - Parsing logs looking like above
 */
function *parseEdit(lines) {
  var result = {type: "edit"};
  yield findValue(lines, "USER ID", "user_id", result);
  yield findValue(lines, "USER EMAIL", "user_email", result);
  yield findValue(lines, "Tree ID", "tree_id", result);
  yield findValue(lines, "Status", "to_from", result);

  result.to_from = result.to_from.split("-->");
  assert(result.to_from.length === 2);
  result.from = result.to_from[0].trim();
  result.to = result.to_from[1].trim();
  return result;
}

// I20160706-20:44:06.177(0)? Update Routine Value for:  [ { _str: '56abad6b21186723291505cf' },
// I20160706-20:44:06.178(0)?   { _str: '56abad6b21186723291505d6' },
// I20160706-20:44:06.178(0)?   { _str: '56abad6b21186723291505d8' },
// I20160706-20:44:06.178(0)?   { _str: '56abad6b21186723291505da' },
// I20160706-20:44:06.179(0)?   { _str: '56abad6c21186723291505e3' },
function *parseRoutine(lines, line) {
  var result = {type: "routine_flag"};
  yield findArray(lines, "Update Routine Value for", "tree_ids", result, line, true);
  
  //"{ _str: '56abad70211867232915062a' }"
  result.tree_ids = _.map(result.tree_ids, tree_id => tree_id.slice(9, -3));
  return result;
}


/**
 * @function findArray - parses a multi line array 
 * @param {Generator} lines co generator of lines
 * @param {String} label the expected label for the line
 * @param {String} field_name the name of the array field in teh result
 * @param {String} first_line if the frist line has already been read pass it in here
 * @param {Boolean} wrap When parsing the array should I wrap the coma delimited elements with a quote.
 */
function *findArray(lines, label, field_name, result, first_line, wrap) {
  wrap = wrap || false;
  if(first_line) {
    first_line.split(":", "label", field_name);
    assert(first_line.label === label);
    result[field_name] = first_line[field_name]; 
  } else {
    yield findValue(lines, label, field_name, result);
  }
  
  
  var arr = result[field_name];
  while(!arr.endsWith(']')) {
    var line = new LineParser(yield lines.next().value);    
    arr += line.content;    
  }
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
    result[field_name] = arr;

  } else {
    arr = arr.replaceAll("'", '"');
    result[field_name] = JSON.parse(arr);
  }
  
  
}


function *findValue(lines, label, field_name, result) {
  for(var line of lines) {
    line = yield line;
    if(line) {
      line = new LineParser(line);
      if(line.content.startsWith(label)) {
        line.split(":", "label", field_name);
        assert(line.label === label);
        result[field_name] = line[field_name];
        return line;
      } else {        
        if(!isSkipable(line.content)) {
          console.log("Skipping", line.date, line.content, label, line.line);
          process.exit();          
        }
      }
    }
  }
}



var skipable = ["Fetching batch", "Cufs published", "Divisions published", "Pmds published",
"(STDERR) Trying to assign already assgined trees.", "generateTileCache", "ADMIN Cufs",
"Drilldown Published", "Exception while ", "at ", "- - - - -"];
function isSkipable(line) {
  for(var i = 0; i < skipable.length; i++) {
    var prefix = skipable[i];          
    if(line.startsWith(prefix)) {
      return true;
    }
  }
  return false;
}





var parsers = {
  "TREES Assign": parsePushAssign,
  "TREES Unassign": parsePushAssign,
  "TREES Push": parsePushAssign,
  "TREE EDIT": parseEdit,
  "Update Routine": parseRoutine
};


function *process_file(file_path) {
  var s = fs.createReadStream(file_path).pipe(es.split());
  var lines = stream_gen(s);
  var parsed_results = [];
  for(var line of lines) {
    line = yield line;
    if(line) {
      line = stripAnsi(line);
      
      if(line.startsWith("I201")) {
        line = new LineParser(line);
        for(var starter in parsers) {        
          if(line.content.startsWith(starter)) {
            var result = yield parsers[starter](lines, line);
            result.date = line.date;
            parsed_results.push(result);
          } 
        }
      }
    }
  }
  console.log("PROCESSED");
  return parsed_results;
}


module.exports = process_file;

if (require.main === module) {
  utils.bakerGen(process_file, {default: true});
  utils.bakerRun();  
}
