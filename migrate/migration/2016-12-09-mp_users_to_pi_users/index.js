/**
 * @fileoverview Some trees are missing pi user id this attempts to fill it in from history
 */

var utils = require('dsp_shared/lib/cmd_utils');
utils.connect(['meteor', 'postgres']);

var User = require('dsp_shared/database/model/users');
var TreeHistory = require("dsp_shared/database/model/tree-history");
var Tree = require("dsp_shared/database/model/tree");
var stream = require('dsp_shared/database/stream');


/**
 * Attempt to find cuf ids for MP users
 */
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
  if(user_name) {
    user_name = user_name.toLowerCase();
  }
  if(cuf_name.toLowerCase() === user_name) {
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


function *run(fix) {
  var query = {status: /^[2345]/, pi_user_id: null};
  var count = yield Tree.find(query).count();
  var i = 0;
  for(var tree of stream(Tree, query)) {
    tree = yield tree;
    if(tree) {
      i++;
      console.log("Tree", i, "of", count, tree._id);
      var success = yield setByPIUserIDHistory(tree, fix);
      if(!success) {
        success = yield setByStatusChange(tree, fix);
      }
      
    }
  }
}

/**
 * This looks for pi_user_id in the tree history
 */
function *setByPIUserIDHistory(tree, fix) {
  var hists = yield TreeHistory.find({object_id: tree._id, "action_value.pi_user_id": {$nin: [null, '---deleted---']}});
  
  if(hists.length > 0) {    
    for(var i = 0; i < hists.length; i++) {
      tree.pi_user_id = hists[i].action_value.pi_user_id;
      console.log("PI Found in History", tree._id, tree.pi_user_id);
    }
    if(fix) {
      yield tree.save();
    }
    return true;
  } else {
    return false;
  }
}

var statuses = {
  "0":	"ignored",
  "1":	"left",
  "2":	"no trim",
  "3":	"not ready",
  "4":	"ready",
  "5":	"worked",
  "6":	"deleted"
};


function *setByStatusChange(tree, fix) {
  var query = {object_id: tree._id, "action_value.status": /^.[12]/};
  
  var prev_status = null;
  for(var hist of stream(TreeHistory, query, {request_created: 1})) {
    hist = yield hist;
    if(hist) {
      var status = statuses[hist.action_value.status[0]];
      if(status !== prev_status) {
        if(status === "no trim" || status === "ready") {
          console.log("FOUND STATUS CHANGE", hist);
          
          if(hist.performer_type === "Manager-Planer User") {
            var user = yield User.findOne({_id: hist.performer_id});
            if(user.profile.cuf_id) {
              tree.pi_user_id = user.profile.cuf_id;
              tree.pi_complete_time = tree.pi_complete_time || hist.request_created;            
              if(fix) {
                yield tree.save();
              }
              return true;
            }
          }          
          
        }
        prev_status = status;
      }
      
    }
  }
}


if (require.main === module) {
  utils.bakerGen(run, {default: true});
  utils.bakerGen(setUserCufIds);  
  utils.bakerRun();  
}
