// const Tree = require('dsp_shared/database/model/tree');
// const TreeHistory = require('dsp_shared/database/model/tree-history');
var utils = require('dsp_shared/lib/cmd_utils');
utils.connect(['meteor', 'trans', 'postgres']);
var _ = require('underscore');
var fs = require('fs');
var assert = require('assert');
var stream = require('dsp_shared/database/stream');
var TreeHistory = require("dsp_shared/database/model/tree-history");
var Tree = require("dsp_shared/database/model/tree");

var parse_file = require('./parse_file');
var parse_json_file = require('./json_parser');

// const TreeStates = require('tree-status-codes');

String.prototype.replaceAt=function(index, character) {
    character = character.toString();
    return this.substr(0, index) + character + this.substr(index+character.length);
};


const STATUS_INDEX = 0;

const STATUS_CODE = {
  'ignore':    '0',
  'left':      '1',
  'no_trim':   '2',
  'allgood':   '2',
  'not_ready': '3',
  'notready':  '3',
  'ready':     '4',
  'worked':    '5',
  'deleted':   '6'
};

var processes = {
  // 'assign': processAssign,
  // 'unassign': processUnassign,
  'edit': processEdit,
  // 'push': processPush,
  // 'routine_flag': processRoutine,
};

function *run(log_dir_path, fix, json) {
  console.log("RUN", log_dir_path, fix);
  var query = { request_created: { $type: 2 } };
  var count = yield  TreeHistory.find(query).count();
  assert(count === 0, "bad history request_created type");
  
  
  query = {request_created: null};
  count = yield  TreeHistory.find(query).count();
  assert(count === 0, "null history request_created");
  
  query = {request_created: Date.create("1970-01-01 00:00:00.000Z")};
  count = yield  TreeHistory.find(query).count();
  assert(count === 0, "epoch 0 history request_created");
  
  query = {applied_date: null};
  count = yield  TreeHistory.find(query).count();
  assert(count === 0, "applied date not set");
  
  var missing_source = yield TreeHistory.find({source: null}).count();  
  assert(missing_source === 0, "Tree histories missing source");
  
  // yield setUserCufIds(fix);
  
  var files = fs.readdirSync(log_dir_path);
  var cur_file_date = null;
  var updates = [];
  for(var i = 0; i < files.length+1; i++) {
    var file_name = files[i];
    var file_date = null;
    if(file_name) {
      file_date = file_name.substring("ctrlsys-".length, "ctrlsys-2016-09-24".length);
    }
    if(file_date !== cur_file_date) {      
      updates = _.sortBy(updates, 'date');
      for(var j = 0; j < updates.length; j++) {
        if(processes[updates[j].type]) {
          yield processes[updates[j].type](updates[j], fix);          
        } 
      }
      updates = [];
      cur_file_date = file_date;      
    }
    if(i < files.length && files[i].indexOf('err') === -1) {
      var file_path = log_dir_path+"/"+file_name;
      console.log("file", files[i]);              
      var file_updates = [];
      if(json) {
        file_updates = yield parse_json_file(file_path);
      } else {
        file_updates = yield parse_file(file_path);
      }
       
      Array.prototype.push.apply(updates,file_updates);      
    }    
  }
}






// function *processAssign(update) {
//   var tree_ids = update.tree_ids;
//   update = _.omit(update, 'tree_ids');
//   for(var i = 0; i < tree_ids.length; i++) {
//     update.tree_id = tree_ids[i];
//     // console.log("Trees Assigned", update);
//   }
// }
//
// function *processUnassign(update) {
//   var tree_ids = update.tree_ids;
//   update = _.omit(update, 'tree_ids');
//   for(var i = 0; i < tree_ids.length; i++) {
//     update.tree_id = tree_ids[i];
//     // console.log("Trees Unassigned", update);
//   }
// }
function *processEdit(edit, fix) {
  console.log("edit info", edit);
  // var user = yield User.findOne({_id: edit.user_id});
    
  if(edit.from !== edit.to) {
    console.log("Editing Tree", edit.user_id, edit.user_email, edit.tree_id, edit.from, '-->', edit.to);
    
    assert(STATUS_CODE[edit.from] !== undefined, "Bad Edit Status: "+edit.from);
    assert(STATUS_CODE[edit.to]   !== undefined, "Bad Edit Status: "+edit.to);  
    
    var tree = yield TreeHistory.buildVersion("Tree", edit.tree_id, Date.create(edit.date));
    var user = {_id: edit.user_id, type:"Manager-Planer User"};
    
    console.log("built a tree", edit.tree_id, edit.date, tree);
    if(_.size(tree) !== 0) {
      if(tree.status[STATUS_INDEX] !== STATUS_CODE[edit.from]) {
        console.warn("BAD status change detected", tree.status, tree.status[STATUS_INDEX], STATUS_CODE[edit.from], edit.from, edit.to);
        throw new Error("bad status change");
      }
    } else {
      // missing intial history
      var hist = yield TreeHistory.find({
                                    object_type: "Tree",
                                    object_id: edit.tree_id,
                                    "action_value.status": {$ne: null}
                                }).sort({created: 1});

      if(hist.length > 0) {
        tree = hist[0].action_value;
      } else {
        tree = yield Tree.findOne({_id: edit.tree_id});
      }
      tree.status = tree.status.replaceAt(STATUS_INDEX, STATUS_CODE[edit.from]);
    } 
    var oldTree = JSON.parse(JSON.stringify(tree));
    
    tree._id = tree._id || edit.tree_id;
    tree.status = tree.status.replaceAt(STATUS_INDEX, STATUS_CODE[edit.to]);    

    if(fix) {
      yield TreeHistory.recordTreeHistory(oldTree, tree, user, Date.create(edit.date), 'mp_logs', Date.create(edit.date));
    }
    
  }
}


/**
 * this fixes request_created dates on histories, 
 *  null = hist.created
 *  
 */
function *fix_dates(fix) {
    
  
  yield TreeHistory.update({source: null, performer_type: "User"}, 
                                               {$set:{source: "mobile"}}, {multi:true});
  yield TreeHistory.update({source: null, performer_id: "fix_tree_soruce"}, 
                                               {$set:{source: "fix_tree_soruce_migration"}}, {multi:true});
  yield TreeHistory.update({source: null, performer_id: "mark_tree_as_ignored"}, 
                                               {$set:{source: "mark_tree_as_ignored_migration"}}, {multi:true});
 
  var missing_source = yield TreeHistory.find({source: null}).count();
  assert(missing_source === 0, "Tree histories missing source");
  
  var query = { request_created: { $type: 2 } };
  var total = yield  TreeHistory.find(query).count();
  var hist_stream = stream(TreeHistory, query);
  var count = 0;
  for(var hist of hist_stream){
    hist = yield hist;
    if(hist) {
      count++;
      console.log("FIXING STRING DATES ", count, "of", total, hist._id, hist.request_created);
      hist.request_created = Date.create(hist.request_created);
      hist.markModified('request_created');
      
      if(fix) {
        yield hist.save();
      }
    }
  }
  
  query = {$or: [{request_created: null}, {request_created: Date.create("1970-01-01 00:00:00.000Z")}] };
  total = yield  TreeHistory.find(query).count();
  hist_stream = stream(TreeHistory, query);
  count = 0;    
  for(hist of hist_stream){
    hist = yield hist;
    if(hist) {
      count++;      
      console.log("FIXING HISTORY ", count, "of", total, hist._id, hist.request_created, "=>", hist.created);
      hist.request_created = hist.created;
      if(fix) {
        yield hist.save();
      }
    }
  }

  var applied_field = {
    "api_v2_patches": 'request_created', 
    "mp_logs": 'request_created',
    "api_v3": 'request_created',
    "csv_trim_code_ingest": 'created',
    "fix_tree_soruce_migration": 'created',
    "manager_planer": 'created',
    "mark_tree_as_ignored_migration": 'created',
    "migrateUpdateHistorySchema": 'created',
    "mobile": 'created',
    "set_pi_complete_time_migraton": 'created'
  };
  query = {applied_date: null};
  total = yield  TreeHistory.find(query).count();
  hist_stream = stream(TreeHistory, query);
  count = 0;      
  for(hist of hist_stream) {
    hist = yield hist;
    if(hist) {
      count++;
      if(count%100 === 0) {
        console.log("FIXING APPLIED DATE", count, "of", total, hist._id, hist.applied_date, "=>", hist[applied_field[hist.source]]);
      }
      hist.applied_date = hist[applied_field[hist.source]];
      if(fix) {
        yield hist.save();
      }      
    }
  }
  
}


// function *processRoutine(update) {
//   var tree_ids = update.tree_ids;
//   update = _.omit(update, 'tree_ids');
//   for(var i = 0; i < tree_ids.length; i++) {
//     update.tree_id = tree_ids[i];
//     // console.log("Routine flag edit", update);
//   }
// }

// function *processPush() {
// }


if (require.main === module) {
  utils.bakerGen(run, {default: true});
  utils.bakerGen(fix_dates);
  utils.bakerGen(function *buildTree(tree_id, date){
    return yield TreeHistory.buildVersion("Tree", tree_id, Date.create(date));
  });
  utils.bakerRun();  
}
