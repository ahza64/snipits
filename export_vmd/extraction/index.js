const _ = require('underscore');
const config = require('dsp_shared/config/config').get('meteor');
const co = require('co');
const utils = require('dsp_shared/lib/cmd_utils');
const sugar = require('sugar');
const fs = require('fs');
utils.connect(['meteor']);
const connection = require('dsp_shared/database/connections')('meteor');

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
  var includeExported = params.includeExported || false;
  var query = { status: { $regex: /^[24]/} };

  if(!includeExported) {
    query.exported = { $exists: false };
  }

  if(startDate && endDate) {
    query.pi_complete_time = { $gte: startDate, $lte: endDate };
  }

	query.span_name = { $ne: null };
	query.city = { $ne: null, $exists: true };

  var cufs = yield CufModel.find({ work_type: 'tree_inspect' });
  var aggregates = yield TreeModel.aggregate([{ $match: query }, { $group: { _id: '$pge_pmd_num', trees: { $push: "$$ROOT" }}}]);
  var circuits = yield CircuitModel.find()
  var projects = yield PmdModel.find();
  var workorders = yield WorkorderModel.find({}, { uniq_id: 1, name: 1 });

  for(var i = 0; i < aggregates.length; i++) {
    aggr = aggregates[i];
    var pmd = _.find(projects, prj => prj.pge_pmd_num === aggr._id);
    var packet = new WorkPacket();
		var images = yield AssetModel.find({ _id: { $in: aggr.trees.map(tree => tree.image) } }, { data: 1 });

    aggr.trees.forEach(tree => {
			var uniq_id = tree.pge_pmd_num + tree.span_name + tree.streetNumber + tree.streetName + tree.city + tree.zipcode;
			var workorder = _.find(workorders, wo => wo.uniq_id === uniq_id);
			tree.pi = _.find(cufs, cuf => cuf._id === tree.pi_user_id);
			tree.circuit = _.find(circuits, circuit => circuit.name === tree.circuit_name);
			tree.workorder_id = 'WO-T-' + workorder.name;
    });

    var locations = _.groupBy(aggr.trees, tree => tree.workorder_id);
    var location_names = Object.keys(locations);

		location_names.forEach(name => {
			var location = new TreeLocation();
			locations[name].forEach(tree => {
				var inspector = tree.pi;
				var line = tree.circuit;
				var image = _.find(images, img => img._id === tree.image) || {};
				var record = new TreeRecord(tree, inspector, line, pmd, image.data);
				location.addTree(record);
			});
			packet.addLocation(location);
		});

    var success = yield TreeModel.update({ _id: { $in: aggr.trees.map(tree => tree._id) }}, { $set: { exported: new Date().toISOString() }}, { multi: true });
    if(success){
      console.log('Exported timestamp has been updated');
    } else {
      console.error('Exported timestamp update failed');
    }
  }
};

//baker module
if (require.main === module) {
  var baker = require('dsp_shared/lib/baker');
  utils.bakerGen(run, { opts: 'params', default: true }); 
  baker.run();  
}
