const _ = require('underscore');
require('dsp_shared/config/config').get('meteor');
const utils = require('dsp_shared/lib/cmd_utils');
require('sugar');
const fs = require('fs');
utils.connect(['meteor']);

const TreeModel = require('dsp_shared/database/model/tree');
const CircuitModel = require('dsp_shared/database/model/circuit');
const PmdModel = require('dsp_shared/database/model/pmd');
const CufModel = require('dsp_shared/database/model/cufs');
const AssetModel = require('dsp_shared/database/model/assets');
const WorkorderModel = require('dsp_shared/database/model/workorders');
const WorkPacket = require('../work_packet/work_packet');
const TreeLocation = require("../work_packet/tree_location");
const TreeRecord = require("../work_packet/tree_record");

function *run(params) {
  var startDate = Date.create(params.startDate);
  var endDate = Date.create(params.endDate);

  console.log("from", startDate, "to", endDate);
  var includeExported = params.includeExported || false;
  var query = { status: { $regex: /^[24]/}, pi_user_id: { $exists: true, $ne: null } };

  if(!includeExported) {
    query.exported = { $exists: false };
  }

  if(startDate && endDate) {
    query.pi_complete_time = { $gte: startDate, $lte: endDate };
  }
  var date = JSON.parse(JSON.stringify(new Date())).replace(/:/g, '.');

  query.span_name = { $ne: null };
  query.city = { $ne: null, $exists: true };
  var cufs = yield CufModel.find({ work_type: 'tree_inspect' });
  var aggregates = yield TreeModel.aggregate([{ $match: query }, { $group: { _id: { pge_pmd_num: '$pge_pmd_num', pi_user_id: '$pi_user_id' }, trees: { $push: "$$ROOT" }}}]).exec();
  var circuits = yield CircuitModel.find()
  var projects = yield PmdModel.find();
  var workorders = yield WorkorderModel.find({}, { uniq_id: 1, name: 1 });

  for(var i = 0; i < aggregates.length; i++) {
    var aggr = aggregates[i];
    console.log("aggr", i);

    var pmd = _.find(projects, prj => prj.pge_pmd_num === aggr._id.pge_pmd_num);
    var packet = new WorkPacket();
    var images = yield AssetModel.find({ _id: { $in: aggr.trees.map(tree => tree.image) } }, { data: 1 });
    var cuf = _.find(cufs, cuf => cuf._id === aggr._id.pi_user_id) || cufs[0];

    aggr.trees.forEach(tree => preprareTree(tree, workorders, circuits, cuf));

    var locations = _.groupBy(aggr.trees, tree => tree.workorder_id);
    var location_names = Object.keys(locations);

    location_names.forEach(name => packet.addLocation(createLocation(locations[name], pmd, images)));

    var filename = "vmd_export_"+pmd.pge_pmd_num + "_" + cuf.uniq_id + "_" +"_"+date+".xml";
    fs.writeFile(filename, packet.toXML());
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
    var image = _.find(images, img => img._id === tree.image) || {};
    var record = new TreeRecord(tree, inspector, line, pmd, image.data);
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
