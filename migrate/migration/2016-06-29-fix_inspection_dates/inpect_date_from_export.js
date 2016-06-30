const utils = require('dsp_shared/lib/cmd_utils');
utils.connect(['meteor']);
const fs = require('fs');
const assert = require("assert");
const _ = require('underscore');
const path = require('path');
const Tree = require('dsp_shared/database/model/tree');
require("sugar");
const readCSVFile = require("dsp_shared/lib/read_csv");



function *createMapping(file_path) {
  var records = yield readCSVFile(file_path);
  var inspect_date_mapping = {};
  _.each(records, function(record){
    assert(record.DISPATCHR_ID);
    // console.log("GETTING ID", record.DISPATCHR_ID, record.INSPECT_DATE, Date.create(record.INSPECT_DATE))
    inspect_date_mapping[record.DISPATCHR_ID] = Date.create(record.INSPECT_DATE);
    assert(inspect_date_mapping[record.DISPATCHR_ID].isValid());
  });
  return inspect_date_mapping;
}

function *run(fix) {
  var dir_path = path.dirname(__filename)+'/data';
  console.log("getting data from dir_path", dir_path);
  var files = fs.readdirSync(dir_path);
  // files = ["from_history.csv"];
  var mapping = {};
  for(var i = 0; i < files.length; i++) {
    var file_path = dir_path+"/"+files[i];
    var m = yield createMapping(file_path);
    _.extend(mapping, m);
  } 
  
  var trees = yield Tree.find({tc_complete_time: {$ne: null}, 
    $where: "this.pi_complete_time.toString() == this.tc_complete_time.toString()"});
  
  
  for(i = 0; i < trees.length; i++) {
    var tree = trees[i];
    if(mapping[tree._id.toString()]) {
      if(mapping[tree._id.toString()] >= tree.pi_complete_time) {
        console.error("New date is after the old one", tree._id, tree.pi_complete_time, '==>', mapping[tree._id.toString()]);
      } else {
        console.log("Updating Tree", tree._id, tree.pi_complete_time, '==>', mapping[tree._id.toString()]);
        tree.pi_complete_time = mapping[tree._id.toString()];
        if(fix) {
          yield tree.save();
        }        
      }
      
    } else {
      console.log("Can not find date for tree", tree._id);
    }
  }
}


//baker module
if (require.main === module) {
  utils.bakerGen(run, { default: true }); 
  utils.bakerRun();  
}
