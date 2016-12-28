/**
 * This parser parses the final log after the logs were wrapped in JSON data
 */
var fs = require('fs');
var es = require('event-stream');
var stream_gen = require('dsp_shared/lib/stream_gen');
var stripAnsi = require('strip-ansi');
var utils = require('dsp_shared/lib/cmd_utils');
var assert = require('assert');
utils.connect(['meteor', 'trans', 'postgres']);


//
// function LineStreamer(file_path) {
//
//   var _this = this;
//   function *lines_gen(){
//
//     while(true) {
//       var line = lines.next();
//       if(!line.done) {
//         yield line.value;
//       } else {
//         return;
//       }
//     }
//   }
//   this.gen = lines_gen();
// }



function parseTitle(line, edit){
  edit.date = Date.create(line.startTime);
  edit.type = "edit";
  // console.log("Edit", edit.date.toString(), stripAnsi(line.data[0]));
  assert(stripAnsi(line.data[0]) === "TREE EDIT");  
}
function parseUserId(line, edit){
  assert(line.data[0] === "USER ID: ");
  edit.user_id = line.data[1];
}
function parseUserEmail(line, edit){  
  assert(line.data[0] === "USER EMAIL: ");
  edit.user_email = line.data[1];
}
function parseTreeId(line, edit){  
  assert(line.data[0] === "Tree ID: ");
  edit.tree_id = line.data[1];
}

function parseStatus(line, edit){
  assert(line.data[0] === "Status: ");
  edit.from = stripAnsi(line.data[1]);
  edit.to   = stripAnsi(line.data[3]);
}
var parsers = [parseTitle, parseUserId, parseUserEmail, parseTreeId, parseStatus];

function *process_file(file_path) {
  console.log("process_file", file_path);
  var s = fs.createReadStream(file_path).pipe(es.split());
  var lines = stream_gen(s);
  // var parsed_results = [];
  
  // var parsers = [];
  
  var edit;
  var cur_parsers = [];
  var updates = [];
  for(var line of lines) {
    line = yield line;    
    if ( line ){    
      line = JSON.parse(line);      
      if(cur_parsers.length === 0) {
        cur_parsers = parsers.slice();
        edit = {};
        updates.push(edit);        
      }
      
      // console.log("LINE", line);
      var parse = cur_parsers.shift();      
      parse(line, edit);            
    }
  }
  console.log("process_file", file_path, updates.length);
  return updates;
}






module.exports = process_file;

if (require.main === module) {
  utils.bakerGen(process_file, {default: true});
  utils.bakerRun();  
}
