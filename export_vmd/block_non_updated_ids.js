/**
 * @description This script tries will block out the Exported documents for all trees 
 * that were exported to csv but have not yet had updated external ids in the VMD
 */


const streamCSV = require('dsp_shared/lib/stream_csv');
var db_stream = require('dsp_shared/database/stream');

const utils = require('dsp_shared/lib/cmd_utils');
utils.connect(["meteor"]);
const Export = require('dsp_shared/database/model/export');

function *run(file_path, fix) {
  var updated = {};
  for(var record of streamCSV(file_path)) {
    record = yield record;
    if(record.UpdatedExternalTreeID) {
      console.log("Found Updated", record.UpdatedExternalTreeID);
      updated[record.UpdatedExternalTreeID] = true;
    }
  }

  for(var exp of db_stream(Export, {type: {$in: ["csv_export", "csv_export_block"]}}) ) {
    exp = yield exp;
    if(updated[exp.export_tree_id] && exp.type === "csv_export_block") {
      console.log("Unblocking ", exp.export_tree_id);
      exp.type = "csv_export";
      if(fix) {
        yield exp.save();
      }
    } else if(!updated[exp.export_tree_id] && exp.type === "csv_export") {
      console.log("Blocking ", exp.export_tree_id);
      exp.type = "csv_export_block";
      if(fix) {
        yield exp.save();
      }      
    }
    
  }
  
  
}

if (require.main === module) {

  utils.bakerGen(run, {default: true});  
  utils.bakerRun();  
}
