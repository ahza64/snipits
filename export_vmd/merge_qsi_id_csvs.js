/**
 * @description This was created to merge csv for ID reconciliations with PG&E and QSI systems.
 */
var utils = require('dsp_shared/lib/cmd_utils');
const Sugar = require("sugar");
Sugar.extend();

var parse = require('csv-parse');
var fs = require("fs");
var assert = require("assert");
var BPromise = require("bluebird");
utils.connect(["meteor"]);
var Tree = require('dsp_shared/database/model/tree');

var db_stream = require('dsp_shared/database/stream');
var Export = require('dsp_shared/database/model/export');
// var generate = require('csv-generate');

function *run(qsi_file_path, pge_file_path, data_file_path) {
  var data = {};
  var count = 0;
  console.log("Loading Data");
  for(var record of streamCSV(pge_file_path)) {
    record = yield record;
    count++;
    // assert(!data[record.ExternalTreeID], record.ExternalTreeID+" already exists.");
    console.log("Loaded Record", count, record.ExternalTreeID);
    record.UpdatedExternalTreeID = record.ExternalTreeID;
    record.UpdatedExternalLocID  = record.ExternalLocID;
    data[record.ExternalTreeID] = record;
  }
  
  console.log("Checking exported Trees");
  count = 0;  
  for(var exp of db_stream(Export, {type: {$in: ["csv_export", "vmd_work_packet"]}})) {
    count++;
    exp = yield exp;
    var exported_tree_id;
    if(exp.type === "csv_export") {
      exported_tree_id = exp.workorder_id;
    } else {
      exported_tree_id = exp.export_tree_id;
    }
    
    console.log("Checking tree", count, exported_tree_id, exp.tree_id, exp.export_tree_id);
    if(!data[exported_tree_id]) {
      console.error("Missing expected exported tree", exported_tree_id, exp.tree_id, exp.export_tree_id);
    }
  }
  
  console.log("Updating Data");
  count = 0;
  for(record of streamCSV(qsi_file_path)) {
    record = yield record;
    count++;
    var external_id = record.TREE_DETECTION_ID.toLowerCase();
    if(data[external_id]) {
      console.log("FOUND", count, record.TREEID, record.TREE_DETECTION_ID);
      data[external_id].UpdatedExternalTreeID = record.TREEID;
      data[external_id].UpdatedExternalLocID  = record.TREEID;
      // break;
    }
  }
  

  
  count = 0;
  console.log("Checking Data");
  for(var key in data) {
    if(data.hasOwnProperty(key)) {
      count++;
      record = data[key];
      var query={$or: [{qsi_id: record.UpdatedExternalTreeID}]};

      if(record.UpdatedExternalTreeID.length === 24) {
        query.$or.push({_id: record.UpdatedExternalTreeID});
      }
      var tree = yield Tree.find(query);
      if(tree.length === 1) {
        console.log("VALIDATED TREE", count, record.UpdatedExternalTreeID);
      } else if(tree.length === 0) {
        console.error("Can not find exported tree:", record.UpdatedExternalTreeID);
        record.UpdatedExternalTreeID = null;
        record.UpdatedExternalLocID  = null;
      } else if(tree.length > 1) {
        assert(false, "Multiple Records Found: "+ record.UpdatedExternalTreeID);
      }
    }
  }
  

  var output = [];
  count = 0;
  console.log("Generating Output");
  for(record of streamCSV(pge_file_path)) {
    record = yield record;
    
    record.UpdatedExternalTreeID = data[record.ExternalTreeID].UpdatedExternalTreeID;
    record.UpdatedExternalLocID  = data[record.ExternalTreeID].UpdatedExternalLocID;
    count++;
    output.push(record);
    // assert(!data[record.ExternalTreeID], record.ExternalTreeID+" already exists.");
    console.log("Gerated Output", count, record.ExternalTreeID, record.UpdatedExternalTreeID);
  }
  
  
  fs.writeFile(data_file_path, utils.dumpAsCSV(output), function(err) {
    if(err) {
        return console.log(err);
    }
    console.log(data_file_path, "was saved!");
  }); 
}


function *streamCSV(file_path) {
  console.log("streamCSV", file_path);
  var parser = parse({columns: true});      
  var input = fs.createReadStream(file_path);
  input.pipe(parser);  
  
  
  var done = false;
  var next = null;
  var error = null;
  var next_resolve = null;
  var next_reject = null;

  parser.on('data', function(doc){  
    this.pause();
    if(next_resolve) {
      next_resolve(doc);
      next_resolve = null;
      next_reject = null;
      this.resume();
    } else {
      if(next) {
        throw Error("Handler handled next to fast");
      } else {
        next = doc;
      }
    }
  });
          
  parser.on('error', function (err) {
    // handle err
    error = err;
    if(next_reject) {
      next_reject(err);
    }
  });

  parser.on('close', function () {
    // all done
    done = true;
  });

  parser.on('end', function () {
    // all done
    done = true;
  });

  
  while(!done) {
    yield new BPromise(function(resolve, reject) {      
      if(error) {
        reject(error);
      } else if(next) {
        resolve(next);
        next = null;
        parser.resume();
      } else {
        if(next_resolve) {
          throw Error("Can not get next while still waiting for previous.");
        }
        next_resolve = resolve;
        next_reject = reject;
      }
    });
  }
}






if (require.main === module) {

  utils.bakerGen(run, {default: true});  
  utils.bakerRun();  
}