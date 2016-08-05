const TreeStates = require('tree-status-codes');
const migrate_util = require('dsp_migrate/util');
const _ = require('underscore');

var util = require('dsp_tool/util');
var User = require('dsp_model/user');
var Grid = require('dsp_model/grid');
var PMD = require('dsp_model/pmd');


var TreeV2 = require('dsp_model/tree');
var TreeSchema = require('dsp_model/treeschema'); //missnomer for trees in first circut city system
var TreeV3 = require('dsp_model/meteor_v3/tree'); //updated tree schema
var assert = require('assert');
var cache = {};

const regions = {
  "Sacramento": "North",
  "Sierra": "North",
  "North Bay": "North",
  "North Coast": "North",
  "North Valley": "North",
  "East Bay":	"South",
  "Mission ":	"South",
  "Kern":	"South",
  "Los Padres":	"South",
  "Peninsula":	"South",
  "San Jose":	"South",
  "Central Coast":	"South",
  "Fresno":	"South",
  "Stockton":	"South",
};
var v2Tree_to_v3Tree = {
  _id: "_id",
  status: calculateStatus,
  circuit_name: function*(tree) {
     var circuit = yield getCircuit(tree);
     return circuit.name;
  },
  location: "location",
  pge_pmd_num: function*(tree) {
     var project = yield getProject(tree);
     return project.pge_pmd_num;
  },
  division: function*(tree) {
     var project = yield getProject(tree);
     return project.division;
  },
  type: "type",//tree/zone (tree, zone, shrub)
  pi_complete_time: "complete_time",
  tc_complete_time: "trimmer_complete_time",
  map_annotations: "map_annotations",
  species: "species",
  span_name: "span_name",
  region: function*(tree) {
     var project = yield getProject(tree);
     return regions[project.division];
  },
  qsi_id: "qsi_tree_id",
  project: function(tree) {
    if(tree.status === "deleted" || tree.status === "span_grouped") { 
      return "transmission_2015";
    }
    return tree.project;
  },
  pi_start_time: "start_time",
  pi_user_id: function*(tree){
    return yield lookupUserId(tree, "inspector_user");
  },
  tc_start_time: "trimmer_start_time",
  tc_user_id: function*(tree){
    return yield lookupUserId(tree, "trimmer_user");
  },  
  address: "address", //from mobile app
  trim_code: function(tree){
    return getTask(tree).trim;
  },
  image: function(tree){
    return getTask(tree).image;
  },
  tc_image: function(tree){
    return getTask(tree).image_after;
  },
  ntw_image: function(tree){
    return getTask(tree).ntw_image;
  },
  clearance: function(tree){
    return getTask(tree).clearance;
  },
  notify_customer_value: function(tree){
    return getProperties(tree).notify_customer_value;
  },
  comments: "comments",
  access_code_value: function(tree){
    return getProperties(tree).access_code_value;
  },
  health: "health",
  height: "height",
  dbh: "dbh",
  
  //zone properties
  count: "count",
  zone: "zone",
  min_mgcc: "min_mgcc",
  pge_detection_type: "qsi_priority",
  inc_id: "inc_id",
  created: "created",
  updated: "updated",
};


function calculateStatus(tree){
  return TreeStates.fetchStatusCode(flattenTreeFlags(tree));
}


function getTreeStatus(mobileTree) {
  /* jshint maxcomplexity:15 */
  if(mobileTree.status === 'newTree') { 
    mobileTree.status = "ready";
  }

  if(mobileTree.status === "span_grouped") {
    mobileTree.properties.statusCode = "span_grouped"; //ignored
  }

  if(mobileTree.status === "deleted") {
    mobileTree.properties.statusCode = "deleted";
  } else {
    if(mobileTree.priority === "allgood") {
      mobileTree.status = "no_trim";
    }     
    if(mobileTree.trimmer_status === "complete") {
      mobileTree.status = "worked";
      mobileTree.properties.statusCode = "worked";
    }    
  } 

  if(mobileTree.status === "ready") {
    var properties = mobileTree.properties || {};
    if(properties.access_issue === true || properties.refused === true || properties.environment === true ){
      mobileTree.status = "not_ready";
    }    
  }
  
  var status = mobileTree.properties.statusCode || mobileTree.status || 'left';
  if(mobileTree.type === "zone") {
    status = 'span_zone';
  }
  
  if(status === 'left' && _.contains(["VC3c", "VC3p", "VC2p"], mobileTree.qsi_priority)) {
    status = 'detection_ignored';
  }
  return status;
}

function flattenTreeFlags(mobileTree){
  var treeFlags = {};
  
  if(mobileTree.status === 'newTree') { 
    treeFlags.source = 'pi'; 
  }  
  treeFlags.status = getTreeStatus(mobileTree);
  treeFlags.priority = mobileTree.priority;
  treeFlags.assigned = false;
  treeFlags.dog = mobileTree.properties.dog;
  treeFlags.irate_customer = mobileTree.properties.irate_customer;
  treeFlags.notify_customer = mobileTree.properties.notify_customer;
  treeFlags.ntw_needed = mobileTree.properties.ntw_needed;
  treeFlags.access_issue = mobileTree.properties.access_issue;
  if(mobileTree.warnings){
    treeFlags.vehicle_type = mobileTree.warnings[0];
  }
  treeFlags.environment = mobileTree.properties.environment_value;
  return treeFlags;
}


function *getCircuit(tree) {
  var grid = yield lookupResource(Grid, {_id: tree.grid}, 'grids', tree.grid);
  //all trees should have a grid
  assert(grid, "could not find grid for tree: "+tree._id);
  return grid;
}

function *getProject(tree) {
  var pmd = yield lookupResource(PMD, {pge_pmd_num: tree.pge_pmd_num}, 'pmds', tree.pge_pmd_num);
  return pmd;
}

function *lookupResource(Model, query, cache_name, cache_key) {
  var resource;
  cache[cache_name] = cache[cache_name] || {};
  if(cache[cache_name][cache_key.toString()]){
    resource = cache[cache_name][cache_key.toString()];
  } else {
    resource = yield Model.findOne(query);  
    if(resource) {
      cache[cache_name][cache_key.toString()] = resource;
    }
  }
  return resource;
}


function *lookupUserId(tree, key)  {
  var user_id = tree[key];
  
  if(user_id) {
    var user = yield lookupResource(User, {_id: user_id}, 'users', user_id);
    if(!user) {
      console.error("can not find user", key, user_id);
    }
    return user.vehicle; //cuf id is vehicle id in v3
  }
  return null;
}

function getTask(tree) {
  if(tree.tasks && tree.tasks.length > 0) {
    return tree.tasks[0];
  }
  return {};
}

function getProperties(tree) {
  return tree.properties || {};
}

function *run(fix){
  var grids = yield Grid.find();
  var pmds = yield PMD.find();
  var users = yield User.find();
  var tree_count = 0;
  cache.grids = _.indexBy(grids, function(grid) { return grid._id.toString(); });
  cache.users = _.indexBy(users, function(user) { return user._id.toString(); });
  cache.pmds = _.indexBy(pmds,   function(pmd) { return pmd.pge_pmd_num; });
  for(var i = 0; i < grids.length; i++) {
    var grid = grids[i];
    console.log("looking up trees for grid", grid.name, tree_count);    
    var v2trees = yield TreeV2.find({grid: grid._id});
    var treeSchemas = yield TreeSchema.find({circuit_name: grid.name});
    treeSchemas = _.indexBy(treeSchemas, function(tree) { return tree._id.toString(); });
    console.log("found trees for", grid.name, v2trees.length, _.size(treeSchemas));    
    for(var j = 0; j < v2trees.length; j++) {
      tree_count++;
      var v2tree = v2trees[j];
      var treeSchema =  treeSchemas[v2tree._id.toString()]; // || {project: 'transmission_2015'};
      if(!treeSchema) {        
        treeSchema = yield TreeSchema.findOne({_id: v2tree._id.toString()});
      }
      if(!treeSchema) {
        console.log("COULD NOT FIND TREE SCHEMA", v2tree._id);
      }
      treeSchema = treeSchema || {};
      var v3tree = yield mergeTreeVersions(v2tree, treeSchema);
      if(fix) {        
        var updated = yield TreeV3.findOneAndUpdate({_id: v3tree._id}, v3tree, {upsert:true});
        if(!updated) { 
          console.error("Tree v3 not update", v3tree._id);
        }
      }
    }
  }
}


function *migrateTreeId(_id) {
  var v2tree = yield TreeV2.findOne({_id: _id});
  var treeSchema = yield TreeSchema.find({_id: _id});
  return yield mergeTreeVersions(v2tree, treeSchema);
}

function *migrateTree(tree) {
  return yield migrate_util.applyMigrationSchema(v2Tree_to_v3Tree, tree);
}

function *mergeTreeVersions(v2Tree, treeSchema) {
  treeSchema = treeSchema || {};
  var tree = JSON.parse(JSON.stringify(treeSchema));
  var migrated = yield migrateTree(v2Tree);
  tree = _.extend(tree, migrated);
  delete tree.__v;
  return tree;
}
function *migrateTreeId(_id) {
  var v2tree = yield TreeV2.findOne({_id: _id});
  var treeSchema = yield TreeSchema.findOne({_id: _id});
  var result = yield mergeTreeVersions(v2tree, treeSchema);
  return result;
}

if (require.main === module) {
  var baker = require('dsp_tool/baker');
  util.bakerGen(run, {default:true});
  util.bakerGen(migrateTreeId);
  baker.run();
}

module.exports = {
  _migrateTree: migrateTree
};
