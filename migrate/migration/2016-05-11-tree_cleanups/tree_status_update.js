var util = require('dsp_tool/util');
var TreeV3 = require('dsp_model/meteor_v3/tree'); //updated tree schema

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
var assert = require('assert');

String.prototype.replaceAt=function(index, character) {
    return this.substr(0, index) + character + this.substr(index+character.length);
};

function *run(fix){
  console.debug("run migration");
  
  var thistory = yield TreeHistory.find({action_field: "status"}).sort({created: 1, _id: 1});
  // var trees = yield TreeV3.find({status: {$regex: /^[1245]...........[^0]/}}).select('_id status').lean();
  console.log("found trees", thistory.length);
  var trees = {};
  for(var i = 0; i < thistory.length; i++) {
    var tree_history = thistory[i];
    if(!tree_history.created) {
      // tree_history.created  = tree_history._id.getTimestamp();
      console.log("ERRROR NO CREATED DATE, run tree_history_schema_change migration");
      assert(tree_history.created);
    }
    var data = {
      _id: tree_history._id.toString(),
      tree_id: tree_history.get("object_id").toString(),
      date: tree_history.created,
      value: tree_history.action_value_to,
      value_from: tree_history.action_value_from
    };
    if(!trees[data.tree_id]) {
      trees[data.tree_id] = data;
    } else if(trees[data.tree_id].date <= data.date){
      data.value_from = trees[data.tree_id].value_from;
      console.log("found better", trees[data.tree_id].date,  data.date);
      console.log("     ", trees[data.tree_id].value_from, trees[data.tree_id].value, data.value);
      trees[data.tree_id] = data;
    } else {
      console.log("------>>found worse", data.tree_id, trees[data.tree_id].date,  data.date, trees[data.tree_id].value, data.value);
    }
    
  }
  
  
  yield processTrees(trees, fix);
  
}

function *processTrees(trees, fix) {
  console.log("Ready to update");
  for(var tree_id in trees) {
    if(trees.hasOwnProperty(tree_id)) {
      var tree_hist = trees[tree_id];
      var tree = yield TreeV3.findOne({_id: tree_id});
      // console.log("status", tree_id);
      if(!tree){
        console.error("OMG OH NO tree missing ", tree_id);
      }else if(tree.status !== tree_hist.value) {
        console.error("OMG OH NO final values don't match", tree_id, tree_hist.value, tree.status);
      } else {
        var status = tree.status;
        if(status[12] !== '0') {
          if(fix) {
            yield fixStatus(tree, tree_hist);
          }
        }
      } 
    }
  }
}


function *fixStatus(tree, tree_hist) {
  var newValue = tree.status.replaceAt(11, "00");

  console.log("Fixing bad state tree", tree._id, tree_hist.value_from, tree.status, newValue);
  if(tree.status[0] === '3') {
    console.log("Unsure Fix", tree._id, tree_hist.value_from, tree.status);
  }

  yield TreeHistory.create({
    action_code: "update",
    action_field: "status",
    action_value_from: tree.status,
    action_value_to: newValue,
    object_type: "Tree",
    object_id: tree._id,
    performer_id: "tree_status_update.js",
    performer_type: "Migration Script",
    created: new Date()
  });
  
  tree.status = newValue;
  yield tree.save();
}

if (require.main === module) {
  var baker = require('dsp_tool/baker');
  util.bakerGen(run, {default:true});
  baker.run();
}
