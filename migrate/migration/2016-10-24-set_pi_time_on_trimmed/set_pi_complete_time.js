#!/bin/env node
/*
   @author gabe@dispatchr.com
   @fileoverview sets source to mobile for all tree histories that do not have a source attribute.
*/
var utils = require('dsp_shared/lib/cmd_utils');
utils.connect(['meteor', 'postgres']);
var Tree = require("dsp_shared/database/model/tree");
var stream = require("dsp_shared/database/stream");
var TreeHistory = require("dsp_shared/database/model/tree-history");

function *run(fix){
  console.log("Setting tree history source");
  var query = {pi_complete_time: null, pi_start_time: {$ne: null}, status: /^5/};
  var count = yield Tree.find(query).count();
  console.log("Fixing Trees", count);
  var tree_count = 0;
  for(var tree of stream(Tree, query)) {
    tree = yield tree;
    if(tree) {
      console.log("Setting compete date", tree.status, tree.pi_start_time, tree.pi_complete_time);
      tree_count++;
      
      if(fix) {
        var old_tree = utils.toJSON(tree);
        tree.pi_complete_time = tree.pi_start_time;
        yield tree.save();
        var mig_user = {_id: 'set_pi_complete_time', type:"Migration"};
        yield TreeHistory.recordTreeHistory(old_tree, tree, mig_user, null, 'set_pi_complete_time_migraton');
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

