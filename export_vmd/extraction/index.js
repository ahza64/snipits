const _ = require('underscore');
require('dsp_shared/config/config').get('meteor');
const utils = require('dsp_shared/lib/cmd_utils');
require('sugar');
const fs = require('fs');
utils.connect(['meteor']);

const assert = require('assert');
const mongoose = require('mongoose');
const TreeModel = require('dsp_shared/database/model/tree');
const CircuitModel = require('dsp_shared/database/model/circuit');
const PmdModel = require('dsp_shared/database/model/pmd');
const CufModel = require('dsp_shared/database/model/cufs');
const AssetModel = require('dsp_shared/database/model/assets');
const WorkorderModel = require('dsp_shared/database/model/workorders');
const WorkPacket = require('../work_packet/work_packet');
const TreeLocation = require("../work_packet/tree_location");
const TreeRecord = require("../work_packet/tree_record");
const Export = require("dsp_shared/database/model/export");

var export_dir = "vmd_export";

function buildQuery(startDate, endDate, includeExported, treeIds) {
  console.log("from", startDate);
  console.log("to", endDate);
  console.log("includeExported", includeExported);  
  console.log("treeIds", treeIds);
  var query = { status: { $regex: /^[245]/}, pi_user_id: { $exists: true, $ne: null } };

  if(!includeExported) {
    query.exported = null;
  }

  if(startDate) {
    query.pi_complete_time = {$gte: startDate};
  }
  if(endDate) {
    query.pi_complete_time = _.extend({}, {$lte: endDate}, query.pi_complete_time);
  }

  query.span_name = { $ne: null };
  query.city = { $ne: null };
  if(treeIds) {
    query._id = {$in: treeIds};
  }
  return query; 
}



function *run(startDate, endDate, includeExported, treeIds, export_name, email) {
  if(startDate === undefined) {
    var export_dates = yield TreeModel.distinct("exported", {});
    export_dates.sort(function(a,b){
      return b - a;
    });
    startDate = export_dates[0];
  } else if(startDate) {
    startDate = Date.create(startDate);
  }
  if(!endDate) {
     endDate = new Date().utc(true);
  } else {
    endDate = Date.create(endDate);
  }
  includeExported = includeExported || false;
  
  if(treeIds && _.isString(treeIds)) {
    treeIds = treeIds.split(',');
    treeIds = _.map(treeIds, function(t) { return mongoose.Types.ObjectId(t); });
  }

  if(!export_name) {
    export_name = JSON.parse(JSON.stringify(new Date())).replace(/:/g, '.');  
  }
  if(export_name) {
    if(!fs.existsSync(export_dir)){
      fs.mkdir(export_dir);
    }    
    export_dir = [export_dir, export_name].join('/');
    console.log("UPDATING EXPORT DIR", export_dir);
  }
  return yield generateWorkPacket(startDate,endDate, includeExported, treeIds, export_name, email);
}    
function *generateWorkPacket(startDate,endDate, includeExported, treeIds, export_name, email) {
  var query = buildQuery(startDate, endDate, includeExported, treeIds);
  var cufs = yield CufModel.find({ work_type: 'tree_inspect' });
  
  console.log("QUERY", query);
  var aggregates = yield TreeModel.aggregate([{ $match: query }, 
    { $group: { 
      _id: { pge_pmd_num: '$pge_pmd_num', pi_user_id: '$pi_user_id' }, 
      trees: { $push: "$$ROOT" }
    }}]).exec();
  var circuits = yield CircuitModel.find();
  var projects = yield PmdModel.find();
  var workorders = yield WorkorderModel.find({}, { uniq_id: 1, name: 1 });

  for(var i = 0; i < aggregates.length; i++) {
    var aggr = aggregates[i];
    console.log("aggr", i);

    var pmd = _.find(projects, prj => prj.pge_pmd_num === aggr._id.pge_pmd_num);
    var packet = new WorkPacket(email);
    var images = yield AssetModel.find({ _id: { $in: aggr.trees.map(tree => tree.image) } }, { data: 1 });
    var cuf = _.find(cufs, cuf => cuf._id.toString() === aggr._id.pi_user_id.toString());

    aggr.trees.forEach(tree => preprareTree(tree, workorders, circuits, cuf));

    var locations = _.groupBy(aggr.trees, tree => tree.workorder_id);
    var location_names = Object.keys(locations);

    

    for(var j = 0; j < location_names.length; j++){
      var name = location_names[j];
      yield checkLocation(name, locations[name]);
      packet.addLocation(createLocation(locations[name], pmd, images));
    }

    var filename = "vmd_export_"+pmd.pge_pmd_num + "_" + cuf.uniq_id + "_" +"_"+export_name+".WR";
    if(!fs.existsSync(export_dir)){
      fs.mkdir(export_dir);
    }
    console.log("Creating ", export_dir, filename);
    fs.writeFile(export_dir+"/"+filename, packet.toXML());
  }
}

function preprareTree(tree, workorders, circuits, cuf) {
  var uniq_id = tree.pge_pmd_num + tree.span_name + tree.streetNumber + tree.streetName + tree.city + tree.zipcode;
  var workorder = _.find(workorders, wo => wo.uniq_id === uniq_id);
  tree.pi = cuf;
  tree.circuit = _.find(circuits, circuit => circuit.name === tree.circuit_name);
  tree.workorder_id = 'WO-T-' + workorder.name;
  return tree;
}

/**
*   @description This checks to see if trees with this location have been exported.
*   Exports must follow the following rules:
*     * Location ids (workorder ids) must be uniq.  Since we may export trees in the same workorder seperately.
*       We could not export trees until all trees in the workorder are exported and porbably in most cases all
*       trees in a workorder would be inspected.  But this it would impose limitaitons we would have to force
*       throughout the system.  (No trees could be added once a location was exported.  Trees could not be moved
*       between workorders if better groupings are found)
*     * If it has been exported before all the tree that were in the original workorder must be there.
* 
*   The idea of this is to make sure that this workorder_id has not be exported before and that all the trees in
*   the location have the same workorder_id.
* 
*   We will need an external process to fix this condition if it occurs.
*   
*/  
function *checkLocation(wo_id, trees) {
  var base_wo_id = wo_id;
  var query =  {workorder_id: {$regex: "^"+wo_id+"[A-Z]*"}};
  var exported_ids = yield Export.distinct("workorder_id", query);

  
  var suffix = "";
  if(exported_ids.length > 0) {    
    suffix = String.fromCharCode(65 + exported_ids.length - 1);
    assert(suffix <= 'Z', "ERROR: WO location suffix logic does not support more than 26 sub locations");
  }
  
  wo_id = wo_id+suffix;
  var exported = yield Export.find({workorder_id: wo_id});
  assert(exported.length === 0, "ERROR: Can not create location with previously exported workorder_id: "+wo_id);
  
  for(var i = 0; i < trees.length; i++) {
    var tree = trees[i];
    assert(base_wo_id === tree.workorder_id, "ERROR, Trees with multiple workorder_ids in this location: "+
                                          base_wo_id+" >> "+tree.workorder_id);
    tree.workorder_id = wo_id;                                
  }
  console.log("CHECK LOCATION", base_wo_id, wo_id);
}


function createLocation(trees, pmd, images) {
  var location = new TreeLocation();
  trees.forEach(tree => {
    var inspector = tree.pi;
    var line = tree.circuit;
    var image = _.find(images, img => tree.image && img._id.toString() === tree.image.toString());
    var record = new TreeRecord(tree, inspector, line, pmd, image);
    location.addTree(record);
  });
  return location;
}

//baker module
if (require.main === module) {
  var baker = require('dsp_shared/lib/baker');
  utils.bakerGen(run, { opts: 'params', default: true }); 
  baker.run();  
}
