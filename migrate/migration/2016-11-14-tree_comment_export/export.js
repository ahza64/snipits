/**
 * @fileoverview Tree Comment Export - this is a dump of all the exported trees that should have comments
 */


var util = require('dsp_shared/lib/cmd_utils');
util.connect(["meteor"]);

const Tree = require('dsp_shared/database/model/tree');
const Export = require("dsp_shared/database/model/export");
const stream = require('dsp_shared/database/stream');
const json2csv = require('json2csv');
const fs = require('fs');
const _ = require('underscore');
const BPromise = require('bluebird');



fs.writeFileAsync = BPromise.promisify(fs.writeFile);

function *run(output) {
  output = output || "comments_export.csv";
  var csv = [];
  var query = {exported_worked: {$ne: null}, comments: {$nin: ["", null]}};
  var total = yield Tree.find(query).count();
  var exports = yield Export.find({type: 'vmd_work_complete'});
  exports = _.indexBy(exports, ex => ex.tree_id.toString());
  
  var i = 0;
  for(var tree of stream(Tree, query)) {
    tree = yield tree;
    if(tree) {
      console.log("Got Tree", i++, "of", total);
      var ex = exports[tree._id.toString()];
      csv.push({ExternalTreeId: ex.export_tree_id, Comment: tree.comments});
    }
  }
  csv = json2csv({ data: csv, fields:  ["ExternalTreeId", "Comment"]});  
  yield fs.writeFileAsync(output, csv);
    
}


//baker module
if (require.main === module) {
  util.bakerGen(run, {default: true});
  util.bakerRun();
}
