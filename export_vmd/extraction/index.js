const _ = require('underscore');
require('dsp_shared/config/config').get('meteor');
const utils = require('dsp_shared/lib/cmd_utils');
require('sugar');
const fs = require('fs');
utils.connect(['meteor']);

const assert = require('assert');
const validation = require('../validation');
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


const WorkComplete = require("../work_complete/work_complete");
const WorkCompleteGroup = require("../work_complete/work_complete_group");


var export_dir = "vmd_export";
var current_workorder_ids = {};


function buildQuery(startDate, endDate, includeExported, treeIds, workComplete) {
  console.log("from", startDate);
  console.log("to", endDate);
  console.log("includeExported", includeExported);  
  console.log("treeIds", treeIds);
  var query;
  if(workComplete) {
    query = {tc_user_id: { $ne: null }, status: { $regex: "^[5]"}};
  } else {
    query = {pi_user_id: { $ne: null }, status: { $regex: "^[245]"}};
  }

  var exported_field = 'exported';      
  var date_field = "pi_complete_time";
  if(workComplete) {
    exported_field = 'exported_worked';
    date_field = "tc_complete_time";
  } 
  
  if(!includeExported) {
    query[exported_field] = null;
  }

  if(startDate) {
    query[date_field] = {$gte: startDate};
  }
  if(endDate) {
    query[date_field] = _.extend({}, {$lte: endDate}, query[date_field]);
  }

  query.span_name = { $ne: null };
  query.city = { $ne: null };
  if(treeIds) {
    query._id = {$in: treeIds};
  }
  return query; 
}


/**
 * @param {String} startDate the start range of tree inspections.  
 *                  null == start of time. "last_export" === date of the last export
 * @param {String} endDate the end range of tree inspeciton date.  null == now
 * @param {Boolean} includeExported
 * @parms {String|Array} Comma delimited tree ids or list of tree ids to export
 * @parms {Stirng} exportName sub directory to store export files
 * @parms {String} email email address for test system to send errors 
 */
function *run(startDate, endDate, includeExported, treeIds, exportName, email, workComplete, incrementTime, skipValidate) {
  if(!skipValidate) {
    var dataIsValid = yield validation.run();
    console.log(dataIsValid);
    if(!dataIsValid) {
      console.log('Validation Failed');
      return;
    }
  }
  
  //sanitize input
  if(startDate === "last_export") {
    var field = "exported";
    if(workComplete) {
      field = "exported_worked";
    }
    var export_dates = yield TreeModel.distinct(field, {});
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

  if(!exportName) {
    exportName = JSON.parse(JSON.stringify(new Date())).replace(/:/g, '.');  
  }
  if(exportName) {
    if(!fs.existsSync(export_dir)){
      fs.mkdir(export_dir);
    }    
    export_dir = [export_dir, exportName].join('/');
    console.log("UPDATING EXPORT DIR", export_dir);
  }
  if(workComplete) {
    return yield generateWorkComplete(startDate,endDate, includeExported, treeIds, exportName, email, incrementTime);
  } else {
    return yield generateWorkPacket(startDate,endDate, includeExported, treeIds, exportName, email, incrementTime);
  }
}    


function *generateWorkComplete(startDate, endDate, includeExported, treeIds, exportName, email) {
  var query = buildQuery(startDate, endDate, includeExported, treeIds, true);
  console.log("TREE QUERY", query);
  
  var aggregates = TreeModel.aggregate([{ $match: query }, 
    { $group: { 
      _id: { pge_pmd_num: '$pge_pmd_num', division: '$division' }, 
      trees: { $push: "$$ROOT" }
  }}]);
  aggregates.options = { allowDiskUse: true }; 
  aggregates = yield aggregates.exec();
  
  var tree_count_f = yield TreeModel.find(query).count();
  var cufs = yield CufModel.find({ work_type: 'tree_trim' });   
  cufs = _.indexBy(cufs, cuf => cuf._id.toString());
  
  
  
  var export_warnings = 0;
  var tree_count = 0;
  for(var i = 0; i < aggregates.length; i++) {
    var aggr = aggregates[i];
    console.log("Grouping ", i, "of", aggregates.length, aggr._id);
    
    var trees = aggr.trees;
    var results = yield createGroups(trees, cufs, email);
    export_warnings += results.warnings;
    tree_count += results.tree_count;
    writeGroups(results.groups, exportName);
  }
  console.log("tree coutns", tree_count, tree_count_f);
  if(export_warnings) {
    console.warn("Trees Not Exported via vmd_work_packet: ", export_warnings);
  }
}



function *createGroups(trees, cufs, email) {
  var groups = {};
  var export_warnings = 0;
  
  var images = yield AssetModel.find({ _id: { $in: _.map(trees, tree => tree.tc_image) } }, { data: 1 });
  var exports = yield Export.find({type: {$in: ["csv_export", "vmd_work_packet"]}, tree_id: {$in: _.map(trees, tree => tree._id)}});

  exports = _.indexBy(exports, exp => exp.tree_id.toString());
  images = _.indexBy(images, image => image._id.toString());

  for(var i = 0; i < trees.length; i++) {
    var tree = trees[i];  
    var image = null;
    if(tree.tc_image) {
      image = images[tree.tc_image.toString()];
    }
    var cuf = cufs[tree.tc_user_id.toString()];    
    var exp = exports[tree._id.toString()];
  
    assert(cuf, "Cuf Missing: "+tree.tc_user_id);
    assert(cuf.company, "Cuf Missing Company: "+cuf._id);
  
    if(!exp) {
      if(!tree.exported) {
        console.error("Tree Not Exported", tree._id, tree.pi_complete_time, tree.tc_complete_time);
      } else {
        export_warnings++;
      }
    } else if(!tree.trim_code) {
      console.error("Missing Trim Code", tree._id);
    } else {      


      groups[cuf.company] = groups[cuf.company] || new WorkCompleteGroup();      
      var group = groups[cuf.company];
      
      
      tree.workorder_id = exp.workorder_id;
      var work_complete = new WorkComplete(tree, cuf, image, email);
      group.addWorkComplete(work_complete);      
    }    
  }
  
  return {groups: _.values(groups), warnings: export_warnings, tree_count: trees.length};
}

function writeGroups(groups, exportName) {  
  for(var i = 0; i < groups.length; i++) {
    var group = groups[i];
    var filename = "vmd_export_"+ group.get('contractor')+ "_" + group.get('division')+ "_" + 
                                group.get('pmd_num') + "_" +"_"+exportName+".WC";
    console.log("file name", filename);
    if(!fs.existsSync(export_dir)){
      fs.mkdir(export_dir);
    }      
    var path = [export_dir, filename].join('/');
    assert(!fs.existsSync(path), "file already exists");
    console.log("Creating ", export_dir, filename);
    fs.writeFile(path, group.toXML());
  }
}

/**
 * @description generate workpacket export the the deired trees
 */
function *generateWorkPacket(startDate,endDate, includeExported, treeIds, exportName, email, incrementTime) {
  var query = buildQuery(startDate, endDate, includeExported, treeIds);
  var cufs = yield CufModel.find({ work_type: 'tree_inspect' });
  
  console.log("QUERY", query);
  var aggregates = TreeModel.aggregate([{ $match: query }, 
    { $group: { 
      _id: { 
	pge_pmd_num: '$pge_pmd_num', 
	pi_user_id: '$pi_user_id', 
	division: '$division', 
	source_tc: { 
	  $eq: [
	    {
		$substr:[ "$status", 1, 1 ]
	    }, 
            '3'
          ] 
        }
      },  
      trees: { $push: "$$ROOT" }
    }}]);
  aggregates.options = { allowDiskUse: true }; 
  aggregates = yield aggregates.exec();
  var circuits = yield CircuitModel.find();
  var projects = yield PmdModel.find();
  var workorders = yield WorkorderModel.find({}, { uniq_id: 1, name: 1 });

  for(var i = 0; i < aggregates.length; i++) {
    var aggr = aggregates[i];
    console.log("Processing Packet", i, "of", aggregates.length, aggregates[i]._id);

    var pmd = _.find(projects, prj => prj.pge_pmd_num === aggr._id.pge_pmd_num);
    var packet = new WorkPacket(email);
    var images = yield AssetModel.find({ _id: { $in: aggr.trees.map(tree => tree.image) } }, { data: 1 });
    var cuf = _.find(cufs, cuf => cuf._id.toString() === aggr._id.pi_user_id.toString());

    aggr.trees.forEach(tree => preprareTree(tree, workorders, circuits, cuf, incrementTime));

    var locations = _.groupBy(aggr.trees, tree => tree.workorder_id);
    var location_names = Object.keys(locations);

    

    for(var j = 0; j < location_names.length; j++){
      var name = location_names[j];
      yield checkLocation(name, locations[name]);
      packet.addLocation(createLocation(locations[name], pmd, images));
    }


    var filename = "vmd_export_"+pmd.pge_pmd_num + "_" + cuf.uniq_id +"_"+ (aggregates[i]._id.source_tc?"TREE":"PI")+ "_" + aggr._id.division.replace(' ', '') + "_" +"_"+exportName+".WP";
    if(!fs.existsSync(export_dir)){
      fs.mkdir(export_dir);
    }
    var path = export_dir+"/"+filename;
    console.log("Creating ", path);
    assert(!fs.existsSync(path), "file already exists");
    fs.writeFile(path, packet.toXML());
  }
}

function preprareTree(tree, workorders, circuits, cuf, incrementTime) {
   console.log("tree._id", tree._id);
  var uniq_id = tree.pge_pmd_num + tree.span_name + tree.streetNumber + tree.streetName + tree.city + tree.zipcode;
  var workorder = _.find(workorders, wo => wo.uniq_id === uniq_id);
  assert(workorder, "Workorder Not found >> tree: "+tree._id+" >> "+ uniq_id);

  tree.pi = cuf;
  tree.circuit = _.find(circuits, circuit => circuit.name === tree.circuit_name);
  tree.workorder_id = 'WO-T-' + workorder.name;
  
  if(incrementTime) {
    assert(tree.pi_complete_time, "Missing PI complete time: "+tree._id);
    tree.pi_complete_time = Date.create(tree.pi_complete_time).addMinutes(incrementTime);
  }
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

  current_workorder_ids[base_wo_id] = current_workorder_ids[base_wo_id] || [];
  exported_ids = exported_ids.concat(current_workorder_ids[base_wo_id]);
  
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
  current_workorder_ids[base_wo_id].push(wo_id);
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
