var utils = require('dsp_shared/lib/cmd_utils');
require("sugar");
var parse = require('csv-parse');
var _ = require('underscore');
var fs = require("fs");
var assert = require("assert");
var BPromise = require("bluebird");
utils.connect(["meteor"]);
var Tree = require('dsp_shared/database/model/tree');
// var Export = require('dsp_shared/database/model/export');
// var generate = require('csv-generate');

function *run(qsi_file_path, pge_file_path, output_file_path) {
  var output = {};
  var count = 0;
  console.log("Loading Data");
  for(var record of streamCSV(pge_file_path)) {
    record = yield record;
    count++;
    // assert(!output[record.ExternalTreeID], record.ExternalTreeID+" already exists.");
    console.log("Loaded Record", count, record.ExternalTreeID);
    record.UpdatedExternalTreeID = record.ExternalTreeID;
    record.UpdatedExternalLocID  = record.ExternalLocID;
    output[record.ExternalTreeID] = record;
  }
  
  console.log("Updating Data");
  count = 0;
  for(record of streamCSV(qsi_file_path)) {
    record = yield record;
    count++;
    var external_id = record.TREE_DETECTION_ID.toLowerCase();
    if(output[external_id]) {
      console.log("FOUND", count, record.TREEID, record.TREE_DETECTION_ID);
      output[external_id].UpdatedExternalTreeID = record.TREEID;
      output[external_id].UpdatedExternalLocID  = record.TREEID;
      // break;
    }
  }
  
  console.log("Checking Data");
  output = _.values(output);
  for(var i = 0; i < output.length; i++) {
    record = output[i];
    var query={$or: [{qsi_id: record.UpdatedExternalTreeID}]};

    if(record.UpdatedExternalTreeID.length === 24) {
      query.$or.push({_id: record.UpdatedExternalTreeID});
    }
    var tree = yield Tree.find(query);
    if(tree.length === 1) {
      console.log("FOUND TREE", i, record.UpdatedExternalTreeID);
    } else if(tree.length === 0) {
      console.error("No Records Found:", record.UpdatedExternalTreeID);
      record.UpdatedExternalTreeID = null;
      record.UpdatedExternalLocID  = null;
    } else if(tree.length > 1) {
      assert(false, "Multiple Records Found: "+ record.UpdatedExternalTreeID);
    }
  }
  
  
  fs.writeFile(output_file_path, utils.dumpAsCSV(output), function(err) {
    if(err) {
        return console.log(err);
    }
    console.log(output_file_path, "was saved!");
  }); 
  // var generator = generate({columns: _.keys(output[0]), length: 2});
  // generator.pipe(process.stdout);
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