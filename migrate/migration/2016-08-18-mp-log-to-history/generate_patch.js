// const Tree = require('dsp_shared/database/model/tree');
// const TreeHistory = require('dsp_shared/database/model/tree-history');
var utils = require('dsp_shared/lib/cmd_utils');
utils.connect(['meteor', 'trans', 'postgres']);
var _ = require('underscore');
var fs = require('fs');

var parse_file = require('./parse_file');

var processes = {
  'assign': processAssign,
  'unassign': processUnassign,
  'edit': processEdit,
  'push': processPush,
  'routine_flag': processRoutine,
};

function *run(log_dir_path) {
  var files = fs.readdirSync(log_dir_path);
  for(var i = 0; i < files.length; i++) {
    if(files[i].indexOf('err') === -1) {
      var file_path = log_dir_path+"/"+files[i];
      var updates = yield parse_file(file_path);
      console.log("file", files[i]);        
      for(var j = 0; j < updates.length; j++) {
        if(processes[updates[j].type]) {
          processes[updates[j].type](updates[j]);
        } else {
          console.log("SKIPPING", updates[j].type);
        }
      }
    }
  }
}

function processAssign(update) {
  var tree_ids = update.tree_ids;
  update = _.omit(update, 'tree_ids');  
  for(var i = 0; i < tree_ids.length; i++) {    
    update.tree_id = tree_ids[i];
    // console.log("Trees Assigned", update);
  } 

}
function processUnassign(update) {
  var tree_ids = update.tree_ids;
  update = _.omit(update, 'tree_ids');  
  for(var i = 0; i < tree_ids.length; i++) {    
    update.tree_id = tree_ids[i];
    // console.log("Trees Unassigned", update);
  } 
}
function processEdit(edit) {
  // console.log("Editing Tree", edit);
}
function processRoutine(update) {
  var tree_ids = update.tree_ids;
  update = _.omit(update, 'tree_ids');  
  for(var i = 0; i < tree_ids.length; i++) {    
    update.tree_id = tree_ids[i];
    console.log("Routine flag edit", update);
  } 
}

function processPush() {
}


if (require.main === module) {
  utils.bakerGen(run, {default: true});
  utils.bakerRun();  
}
