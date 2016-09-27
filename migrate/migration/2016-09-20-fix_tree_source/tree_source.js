#!/bin/env node
/*
   @author gabe@dispatchr
   @fileoverview fixes corrupt tree source
*/
var utils = require('dsp_shared/lib/cmd_utils');
utils.connect(['meteor', 'postgres']);
var _ = require("underscore");
var assert = require('assert');
var Tree = require("dsp_shared/database/model/tree");
var stream = require("dsp_shared/database/stream");

var TreeHistory = require("dsp_shared/database/model/tree-history");

String.prototype.replaceAt=function(index, character) {
    return this.substr(0, index) + character + this.substr(index+character.length);
};
const SOURCE_INDEX = 1; //index in status string

//status string values for source
const SOURCE_LIDAR     = "1";
// const SOURCE_INSPECTOR = "2";
// const SOURCE_TRIMMER   = "3";

function *run(fix){
  console.log("Updating Corrupt Soruce id");
  
  var trees = yield Tree.find({status: /^[1-5]1/, qsi_id: null});
  var tree_by_id = _.indexBy(trees, tree => tree._id.toString());
  var tree_ids = _.map(trees, tree => tree._id.toString());
  for(var hist of stream(TreeHistory, {object_id: {$in: tree_ids}, "action_value.status": /^.[^1]/})) {
    hist = yield hist;
    if(hist) {
      
      var new_source = hist.action_value.status[SOURCE_INDEX];
      
      var tree = tree_by_id[hist.object_id];
      if(tree.status[SOURCE_INDEX] === SOURCE_LIDAR) {
        console.log("history", hist.object_id, hist.action_value.status[1]);
        var old_tree = utils.toJSON(tree);
        tree.status = tree.status.replaceAt(SOURCE_INDEX, new_source);
        if(fix) {
          yield tree.save();
          var mig_user = {_id: 'fix_tree_soruce', type:"Migration"};
          yield TreeHistory.recordTreeHistory(old_tree, tree, mig_user);
        }      
      } else {
        assert(tree.status[SOURCE_INDEX] === new_source, "Trying to change source from something other than LiDAR: "+tree._id+" "+tree.status);
      }
      
    }
    
  }



}


if (require.main === module) {
  var baker = require('dsp_shared/lib/baker');
  utils.bakerGen(run, {default:true});
  baker.run();
}

module.exports = run;

