// const Tree = require('dsp_shared/database/model/tree');
// const TreeHistory = require('dsp_shared/database/model/tree-history');
var utils = require('dsp_shared/lib/cmd_utils');
utils.connect(['meteor', 'trans', 'postgres']);
var _ = require('underscore');
var fs = require('fs');
var assert = require('assert');
var stream = require('dsp_shared/database/stream');
var User = require('dsp_shared/database/model/users');
var TreeHistory = require("dsp_shared/database/model/tree-history");
var Tree = require("dsp_shared/database/model/tree");

var parse_file = require('./parse_file');

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

function *run(log_dir_path, fix) {
  console.log("RUN", log_dir_path, fix);
  var query = { request_created: { $type: "string" } };
  var count = yield  TreeHistory.find(query).count();
  assert(count === 0, "bad history request_created type");
  
  
  query = {request_created: null};
  count = yield  TreeHistory.find(query).count();
  assert(count === 0, "null history request_created");
  
  query = {request_created: Date.create("1970-01-01 00:00:00.000Z")};
  count = yield  TreeHistory.find(query).count();
  assert(count === 0, "epoch 0 history request_created");
  
  // yield setUserCufIds(fix);
  
  var files = fs.readdirSync(log_dir_path);
  var cur_file_date = null;
  var updates = [];
  for(var i = 0; i < files.length; i++) {
    var file_name = files[i];
    var file_date = file_name.substring("ctrlsys-".length, "ctrlsys-2016-09-24".length);
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
    if(files[i].indexOf('err') === -1) {
      var file_path = log_dir_path+"/"+file_name;
      console.log("file", files[i]);              
      var file_updates = yield parse_file(file_path);
      Array.prototype.push.apply(updates,file_updates);      
    }    
  }
}


function *setUserCufIds(fix) {
  var Cuf = require('dsp_shared/database/model/cufs');
  var users = yield User.find();
  for(var i = 0; i < users.length; i++) {
    var user = users[i];
    var user_email = user.emails[0].address;
    var cufs = yield Cuf.find({scuf: user_email});
    var found_cuf = null;
    
    for(var j = 0; j < cufs.length; j++) {
      var cuf = cufs[j];      
      var cuf_score = cufScore(cuf, user_email, user.profile.name);      
      // console.log("CHECK USER", user.profile.name, user_email, cuf.first, cuf.last, cuf.uniq_id, cuf.active, cuf_score);
      if(cuf_score > 0) {
        if(!found_cuf) {
          found_cuf = cuf;
        } else {
          if(cuf_score > cufScore(found_cuf, user_email, user.profile.name)) {
            found_cuf = cuf;
          }
        }
      }
    }
    if(found_cuf) {
      // console.log("FOUND CUF FOR USER", user.profile.name, user_email, found_cuf.first, found_cuf.last, found_cuf.uniq_id);
      if(user.profile.cuf_id !== found_cuf._id) {

        console.log("Setting User Cuf ID", user._id);
        console.log("Setting User Cuf ID", 'cuf_id:', user.profile.cuf_id, '==>', found_cuf._id);
        console.log("Setting User Cuf ID", 'user:', user.profile.name, user.emails[0].address);
        console.log("Setting User Cuf ID", ' cuf:', found_cuf.first+" "+found_cuf.last, found_cuf.uniq_id, found_cuf.status);
        user.profile.cuf_id = found_cuf._id;
        user.markModified('profile');        
        console.log("TEST", user.profile.cuf_id);
        if(fix) {
          yield user.save();
        }
      }
    }
        
  }
}

function cufScore(cuf, user_email, user_name) {
  var score = 0;
  if(cuf.uniq_id.toLowerCase() === user_email.toLowerCase()) {
    score+=2;
  }
  var cuf_name = cuf.first+" "+cuf.last;
  if(cuf_name === user_name) {
    score++;
  }
  if(score > 0) {
    if(cuf.uniq_id.toLowerCase().includes("@pge.com")) {
      score+=2;
    }
    if(cuf.status === "active") {
      score++;
    }    
  }
  return score;
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
    console.log("TREE ID WHAT HAPPENED", tree);
    if(fix) {
      yield TreeHistory.recordTreeHistory(oldTree, tree, user, Date.create(edit.date), 'mp_logs');
    }
    
  }
}


/**
 * this fixes request_created dates on histories, 
 *  null = hist.created
 *  
 */
function *fix_dates(fix) {
  var query = { request_created: { $type: "string" } };
  var total = yield  TreeHistory.find(query).count();
  var hist_stream = stream(TreeHistory, query);
  var count = 0;
  for(var hist of hist_stream){
    count++;
    hist = yield hist;
    if(hist) {
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
      console.log("FIXING HISTORY ", count, "of", total, hist._id, hist.request_created, "=>", hist.created);
      hist.request_created = hist.created;
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
  
  utils.bakerRun();  
}
