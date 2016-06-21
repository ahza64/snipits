const _ = require('underscore');
require('dsp_shared/config/config').get('meteor');
const utils = require('dsp_shared/lib/cmd_utils');
require('sugar');
const fs = require('fs');
utils.connect(['meteor']);

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

var export_dir = "vmd_export";

function buildQuery(startDate, endDate, includeExported, treeIds) {
  console.log("from", startDate);
  console.log("to", endDate);
  console.log("includeExported", includeExported);  
  console.log("treeIds", treeIds);
  var query = { status: { $regex: /^[24]/}, pi_user_id: { $exists: true, $ne: null } };

  if(!includeExported) {
    query.exported = { $exists: false };
  }

  if(startDate) {
    query.pi_complete_time = {$gte: startDate};
  }
  if(endDate) {
    query.pi_complete_time = _.extend({}, {$lte: endDate}, query.pi_complete_time);
  }

  query.span_name = { $ne: null };
  query.city = { $ne: null, $exists: true };
  if(treeIds) {
    query._id = {$in: treeIds};
  }
  return query; 
}

function *run(startDate, endDate, includeExported, treeIds, export_name) {
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
    var packet = new WorkPacket("gabe@dispatchr.co");
    var images = yield AssetModel.find({ _id: { $in: aggr.trees.map(tree => tree.image) } }, { data: 1 });
    var cuf = _.find(cufs, cuf => cuf._id.toString() === aggr._id.pi_user_id.toString());

    aggr.trees.forEach(tree => preprareTree(tree, workorders, circuits, cuf));

    var locations = _.groupBy(aggr.trees, tree => tree.workorder_id);
    var location_names = Object.keys(locations);

    location_names.forEach(name => packet.addLocation(createLocation(locations[name], pmd, images)));

    var filename = "vmd_export_"+pmd.pge_pmd_num + "_" + cuf.uniq_id + "_" +"_"+export_name+".xml";
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
