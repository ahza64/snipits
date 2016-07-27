/**
 * @description Ingest QSI csv exports and add workorder_ids.
 */

const streamCSV = require('dsp_shared/lib/stream_csv');
const utils = require('dsp_shared/lib/cmd_utils');
utils.connect(["meteor", "trans"]);

const _ = require("underscore");
require("sugar");


// const Tree = require('dsp_shared/database/model/tree');
const Export = require('dsp_shared/database/model/export');
const assert = require('assert');

const TransTree = require('dsp_shared/database/model/trans/tree');
const TransWO = require('dsp_shared/database/model/trans/workorder');

function *run(folder_path, fix) {
  var workorders = {};
  for(var record of streamCSV(folder_path+"/inspect_work.csv")) {
    record = yield record;
    console.log("workorders", record.WO_NUMBER, record.WO_NAME);
    workorders[record.WO_NUMBER] = record.WO_NAME;
  }
  
  var exports = yield Export.find({type: "csv_export"});
  exports = _.indexBy(exports, exp => exp.tree_id.toString());
  
  var bad_exports = yield Export.find({type: "vmd_work_packet"});
  bad_exports = _.indexBy(bad_exports, exp => exp.workorder_id);
  
  for(record of streamCSV(folder_path+"/trees.csv")) {
    record = yield record;
    
    var workorder_id = workorders[record.INSPECT_WO_NUMBER];    
    if(!workorder_id) {
      var tree = yield TransTree.findOne({_id: record.DISPATCHR_ID});
      if(tree) {
        var t_wo = yield TransWO.findOne({_id: tree.inspector_wo});
      }
      assert(t_wo, "Can't find trans workorder for tree:"+record.DISPATCHR_ID);
      workorder_id = "WO-T-"+t_wo.name;
    }
    

    
    workorder_id = workorder_id.replace("WO-T", "WO-TC");
    assert(workorder_id.startsWith("WO-TC-"));
    console.log("trees", record.DISPATCHR_ID, record.INSPECT_WO_NUMBER, workorder_id);

    var bad_export = bad_exports[workorder_id];    
    assert(!bad_export, "Found export with same workorder_id: "+workorder_id);
    
    var tree_exp = exports[record.DISPATCHR_ID];
    assert(tree_exp, "Could not find tree exported record: "+ record.DISPATCHR_ID);
    assert(tree_exp.type === "csv_export", "Tree not exported with csv: "+ record.DISPATCHR_ID);
    tree_exp.workorder_id = workorder_id;
    if(fix) {
      yield tree_exp.save();
    }
  }
  var not_updated = yield Export.find({workorder_id: {$not: /^WO/}, type: "csv_export"}).count();
  console.log("Bad workorder ids remaining", not_updated);
}

if (require.main === module) {

  utils.bakerGen(run, {default: true});  
  utils.bakerRun();  
}
