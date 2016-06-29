require('sugar');
require('dsp_shared/config/config').get('meteor');
const utils = require('dsp_shared/lib/cmd_utils');
const _ = require('underscore');
const mongoose = require('mongoose');

utils.connect(['meteor']);

var BPromise = require('bluebird');
const fs = BPromise.promisifyAll(require('fs'));
const xml2js = BPromise.promisifyAll(require('xml2js'));
const assert = require('assert');
const TreeModel = require('dsp_shared/database/model/tree');
const Export = require("dsp_shared/database/model/export");

function *run(folder, date, unset) {  
  date = Date.create(date);
  if(!date.isValid()) {
    date = new Date();
  }
  console.log("DATE", date);
  
  
  var trees = yield get_trees(folder);


  var exported = date;
  if(unset) {
    exported = null;
  }
  
  var export_type = "vmd_work_packet";
  
  
  yield get_tree_id_objs(trees);
  for(var i = 0; i < trees.length; i++) {
    var tree_export = trees[i];
    tree_export.type = export_type;    
    tree_export.export_date = exported;
        
    var exp = yield Export.findOne({tree_id: tree_export.tree_id, type: export_type});
    if(!unset) {
      assert(exp===null, "Tree already exported");
      yield Export.create(tree_export);
    } else {
      yield Export.remove({type: export_type, tree_id: tree_export.tree_id});      
    } 
  }
  
  var id_objs = _.map(trees, function(t){ return t.tree_id; });  
  console.log("OBJECT IDS", id_objs);
  var update = yield TreeModel.update({_id: {$in: id_objs}}, 
        {$set: {exported: exported}}, {multi: true});
  
  return update;
}


function *get_tree_id_objs(trees) {
  var all_ids = _.map(trees, function(tree){return tree.export_tree_id;});
  var tree_ids = _.filter(all_ids, function(id) { return id.length === 24;});
  var id_objs = _.map(tree_ids, function(id) { return mongoose.Types.ObjectId(id); });

  var db_trees = yield TreeModel.find({$or: [
    {qsi_id: {$in: all_ids}},
    {_id: {$in: id_objs}}
  ]});
  console.log("trees", trees.length);  
  console.log("db trees", db_trees.length);
  assert(trees.length === db_trees.length, "NOT ENOUGH TREES");
  
  var indexed = _.indexBy(trees, 'export_tree_id');
  for(var i = 0; i < db_trees.length; i++) {
    var tree = db_trees[i];
    if(indexed[tree._id.toString()]) {
      indexed[tree._id.toString()].tree_id = tree._id;
    } else if(indexed[tree.qsi_id]) {
      indexed[tree.qsi_id].tree_id = tree._id;
    } else {
      throw Error("Unknown tree gotten from database");
    }
  }
  return indexed;
}

/**
 * @description get trees from export
 * @param {String} folder Folder where the xml exports are
 */
function *get_trees(folder) {
  var files = yield fs.readdirAsync(folder);
  var trees = [];
  
  
  for(var i = 0; i < files.length; i++) {
    var file = files[i];
    if(file.endsWith('WP')) {
      
      file = yield fs.readFileAsync([folder, file].join('/'));
      var work_packet = yield xml2js.parseStringAsync(file);
      work_packet.TreeWorkPacket.TreeLoc.forEach(loc => {
        var workorder_id = loc.ExternalLocID[0];
        loc.TreeRecs.forEach(tree => {
          var tree_id = tree.ExternalTreeID[0];
          trees.push({export_tree_id: tree_id, workorder_id: workorder_id});
        });
      });
    }
  }
  return trees;
  
}



//baker module
if (require.main === module) {
  utils.bakerGen(run, { default: true }); 
  utils.bakerRun();  
}
