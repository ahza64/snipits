#!/bin/env node
/*
   @author gabe@dispatchr
   @fileoverview adds inspection data to tree crew added trees
*/
var utils = require('dsp_shared/lib/cmd_utils');
utils.connect(['meteor']);

var Tree = require("dsp_shared/database/model/tree");
var stream = require("dsp_shared/database/stream");

function *run(fix){
  console.log("Updating Tree Crew trees with pi info");
  for(var tree of stream(Tree, {status: /^.3/, pi_user_id: null})) {
    tree = yield tree;
    if(tree) {
      console.log("Found Tree", tree._id, tree.status, tree.location, tree);
    
      var trees = yield Tree.findNear(tree, 1000, 'ft', {status: /^[2-5][^3]/, pi_user_id: {$ne: null}});

      if(trees && trees[0]) {
        var near_dist = trees[0].dis;
        var near_tree = trees[0].obj;
      
        tree.pi_user_id = near_tree.pi_user_id;
        tree.pi_start_time = tree.created;
        tree.pi_complete_time = tree.tc_start_time || tree.created;
      
        console.log("NEAR TREES", near_tree._id, near_dist, tree.pi_user_id, tree.pi_start_time, tree.pi_complete_time);
        if(fix) {
          yield tree.save();
        }
      } else {
        near_tree = null;
      }
    }
  }



}


if (require.main === module) {
  var baker = require('dsp_shared/lib/baker');
  utils.bakerGen(run, {default:true});
  baker.run();
}

module.exports = run

