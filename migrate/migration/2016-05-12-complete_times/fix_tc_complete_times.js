var util = require('dsp_tool/util');
var TreeV3 = require('dsp_model/meteor_v3/tree'); //updated tree schema
var TreeV2 = require('dsp_model/tree');
var assert = require('assert');

const mongoose = require('mongoose');
const treeHistorySchema = new mongoose.Schema({
  action_code: { type: String, required: true },
  action_field: { type: String, required: true },
  action_value_from: { type: {} },
  action_value_to: { type: {} },
  object_type: { type: String, required: true },
  object_id: { type: String, required: true },
  performer_id: { type: String },
  performer_type: { type: String },
  platform_id: { type: String },
  platform_version: { type: String },
  created: { type: Date }
}, {strict:false});
var util = require('dsp_tool/util');
var connection = require('dsp_model/connections')('meteor');
var TreeHistory = connection.model('treehistories', treeHistorySchema);

String.prototype.replaceAt=function(index, character) {
    return this.substr(0, index) + character + this.substr(index+character.length);
};

function *run(fix){
  console.debug("run migration", fix);
  
  var updates = yield treesToUpdate();
  // var trees = yield TreeV3.find({status: {$regex: /^[1245]...........[^0]/}}).select('_id status').lean();
  console.log("found trees", updates.length);
  for(var tree_id in updates) {
    if(updates.hasOwnProperty(tree_id)){
      var update = updates[tree_id];
      var tree = yield TreeV3.findOne({_id: tree_id});
      if(!tree) {
        console.error("TREE MISSING", tree_id);
      } else if(!tree.tc_complete_time && tree.status[0] === '5') {
        var v2_tree = yield TreeV2.findOne({_id: tree_id});
        var v2_value = null;
        if(v2_tree && v2_tree.trimmer_complete_time) {
          v2_value = v2_tree.trimmer_complete_time;
        }
        
        update.value = update.value || v2_value;
        if(update.value) {
          if(fix) {
            yield fixStatus(tree, update.value);
          } else {
            console.log("use --fix to fix", tree_id, update.value);
          }
        } else {
          console.log("could not find tc_complete_time", tree_id);
        }
      }      
    }
  }
}

function *treesToUpdate() {
  var thistory = yield TreeHistory.find({action_field: "tc_complete_time"}).sort({created: 1, _id: 1});
  var updates = {};
  for(var i = 0; i < thistory.length; i++) {
    var tree_history = thistory[i];
    if(!tree_history.created) {
      // tree_history.created  = tree_history._id.getTimestamp();
      console.log("ERRROR NO CREATED DATE, run tree_history_schema_change migration");
      assert(tree_history.created);
    }
    var tree_id = tree_history.get("object_id").toString();
    if(tree_history.action_value_from === '<value unknown>') {
      tree_history.action_value_from = null;
    }
    var data = {
      _id: tree_history._id.toString(),
      tree_id: tree_id,
      value: tree_history.action_value_to || tree_history.action_value_from
    };
    
    if(!updates[tree_id]) {
      updates[tree_id] = data;
    } 
    if(data.action_code === "delete") {
      updates[tree_id].deleted = true;
    } else {
      updates[tree_id].value = data.value || updates[tree_id].value;
    }    
    
  }
  return updates;
}

function *fixStatus(tree, complete_time) {
  console.log("fixing", tree._id, complete_time);
  yield TreeHistory.create({
    action_code: "update",
    action_field: "tc_complete_time",
    action_value_from: tree.tc_complete_time,
    action_value_to: complete_time,
    object_type: "Tree",
    object_id: tree._id,
    performer_id: "fix_tc_complete_times.js",
    performer_type: "Migration Script",
    created: new Date()
  });
  
  tree.tc_complete_time = complete_time;
  yield tree.save();
}


if (require.main === module) {
  var baker = require('dsp_tool/baker');
  util.bakerGen(run, {default:true});
  baker.run();
}
