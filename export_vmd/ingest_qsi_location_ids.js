var utils = require('dsp_shared/lib/cmd_utils');
require("sugar");
var parse = require('csv-parse');
var _ = require('underscore');
var fs = require("fs");
var BPromise = require("bluebird");
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