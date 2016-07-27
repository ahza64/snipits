/**
 * @description This creates export entries for QSI ingested trees.
 */
var utils = require('dsp_shared/lib/cmd_utils');
require("sugar");
var streamCSV = require('dsp_shared/lib/stream_csv');
var _ = require('underscore');
utils.connect(["meteor"]);
var Tree = require('dsp_shared/database/model/tree');
var Export = require('dsp_shared/database/model/export');


function *run(file_path) {
  var trees = yield Tree.find({exported: {$ne: null}}, {_id: 1, qsi_id: 1, exported: 1});
  var exports = yield Export.find({});
  exports = _.indexBy(exports, exp => exp.tree_id.toString());
  var missing = {};
  var found = {};
  for(var i = 0; i < trees.length; i++) {
    var tree = trees[i];
    var exported_tree_id = tree._id.toString();
    var exp = exports[exported_tree_id];
    if(tree.qsi_id) {
      exported_tree_id = tree.qsi_id;
    }

    
    if(!exp) {
      missing[exported_tree_id] = {
        "export_tree_id" : exported_tree_id,
        // "workorder_id" : "WO-T-160410",
        "tree_id" : tree._id,
        "type" : "csv_export",
        "export_date" : tree.exported
      };
    }
  }
  
  
  if(_.size(missing) > 0) {
    var count = 0;
    for(var record of streamCSV(file_path)) {
      record = yield record;
      count++;
      if(missing[record.TREEID]) {
        console.log("FOUND", count, record.TREEID, record.TREE_DETECTION_ID);
        found[record.TREEID] = missing[record.TREEID];
        delete missing[record.TREEID];
        found[record.TREEID].workorder_id = record.TREE_DETECTION_ID.toLowerCase();
        // break;
      }
    }
  }  
  
  
  // console.log("STILL MISSING", missing);
  console.log("STILL MISSING", _.size(missing));
  
  for(var exported_id in found) {
    if(found.hasOwnProperty(exported_id)) {
      console.log("Saving Export", exported_id);
      yield Export.create(found[exported_id]);
    }
  }
  
  
}








if (require.main === module) {

  utils.bakerGen(run, {default: true});  
  utils.bakerRun();  
}