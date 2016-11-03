// const Tree = require('dsp_shared/database/model/tree');
// const TreeHistory = require('dsp_shared/database/model/tree-history');
var utils = require('dsp_shared/lib/cmd_utils');
utils.connect(['meteor', 'trans', 'postgres']);
var _ = require('underscore');
var fs = require('fs');
var assert = require('assert');


var User = require('dsp_shared/database/model/users');
var TreeHistory = require("dsp_shared/database/model/tree-history");

var parse_file = require('./parse_file');

const TreeStates = require('tree-status-codes');

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
  // yield setUserCufIds(fix);
  
  var files = fs.readdirSync(log_dir_path);
  for(var i = 0; i < files.length; i++) {
    if(files[i].indexOf('err') === -1) {
      var file_path = log_dir_path+"/"+files[i];
      console.log("file", files[i]);              
      var updates = yield parse_file(file_path);
      for(var j = 0; j < updates.length; j++) {
        if(processes[updates[j].type]) {
          yield processes[updates[j].type](updates[j], fix);
        } 
      }
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
    console.log("built a tree", tree);
    if(_.size(tree) === 0) {
      // throw new Error("bad tree");
    } else {
      var user = {_id: edit.user_id, type:"Manager-Planer User"};
      
      if(tree.status[STATUS_INDEX] !== STATUS_INDEX[edit.from]) {
        console.warn("BAD status change detected", tree.status, edit.form, edit.to);
      }
      
      var oldTree = JSON.parse(JSON.stringify(tree));
      tree.status = tree.status.replaceAt(STATUS_INDEX, STATUS_CODE[edit.to]);
      
      
      if(fix) {
        // TreeHistory.recordTreeHistory(oldTree, tree, user, Date.create(edit.date), 'mp ')      
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
  utils.bakerRun();  
}
