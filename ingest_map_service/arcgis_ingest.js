#!/bin/env node
/*
  @author Gabriel Littman
  @fileoverview arcgis ingest command that will ingest transmission trees, lines, and project data
*/

var utils = require('dsp_shared/lib/cmd_utils');
utils.connect(['meteor']);
var esri_util = require("dsp_shared/lib/gis/esri_util");
var http_get = esri_util.http_get;
var assert = require('assert');
var _ = require('underscore');
var migrate_util = require('dsp_shared/lib/migrate');
var BPromise = require("bluebird");
var parse = require('csv-parse');
var fs = require('fs');
var TreeV3 = require("dsp_shared/database/model/tree");
var PMD = require('dsp_shared/database/model/pmd');
var Circuit = require('dsp_shared/database/model/circuit');
var TreeStates = require('tree-status-codes');
var getAddress = require("dsp_shared/lib/gis/google_geocode");

var Ingest = require('dsp_shared/database/model/ingest');

var dsp_project = "transmission_2015";

var detection_priorities = {
  VC1c_URGENT: 1,
  VC1c_AF: 2,
  VC1c_MO: 3, 
  VC2c_UH: 4, 
  VC3c_UH: 5, 
  VC1p_AF: 6, 
  VC1p_MO: 7, 

  VC2c: 8, 
  VC3c: 9, 
  VC2p: 10, 
  VC3p: 11
}; 

/**
 * Entry point of script
 */
function *run(){
  console.log("RUNNING arcgis ingest");
  var project = dsp_project.toUpperCase();
  var host = "https://esri.dispatchr.co:6443";
  var service_path = ["/arcgis/rest/services", project, "MapServer"].join("/");
  var base_url = [host, service_path].join('/');
  var base_params = {
   f: "pjson"
  };

  var latest = yield Ingest.findOne({latest: true});
  if(!latest) {
   latest = yield Ingest.create({latest: true});
   console.log("latest", latest);
  }
  latest.date = new Date();
  latest.script = "arcgis_ingest";
  latest.name = null;
  latest.status = "running";
  latest.details = [];
  yield latest.save();
 
  var service = yield http_get(base_url, base_params);
  for(var i = 0 ; i < service.layers.length; i++) {
    var layer_group = service.layers[i];
    if(layer_group.subLayerIds && layer_group.parentLayerId === -1) {
      var ingest = yield ingestGroup(layer_group, service, base_url);
      latest.details.push(ingest);
    }
  }
  
  latest.status = "complete";
  yield latest.save();
}


function *ingestGroup(layer_group, service, base_url){
  
  var ingest = yield Ingest.findOne({name: layer_group.name, script: "arcgis_ingest"}).sort({date: -1});
  if(ingest) {
    console.log("Layer group previously ingested", layer_group.name);
  } else {
    ingest = yield Ingest.create({
      name: layer_group.name,
      status: "running",
      script: "arcgis_ingest", 
      date: new Date()
    });

    console.log("LAYER GROUP", layer_group.name, layer_group.id);
    for(var j = 0; j < layer_group.subLayerIds.length; j++) {
      var layer_id = layer_group.subLayerIds[j];
      console.log("LAYERS", layer_id);
      var layer = service.layers[layer_id];
      if(layer.name.endsWith("TreeTops")) {
        yield processLayer(base_url, layer);
      }else if(layer.name.endsWith("Spans")) {
        yield processSpansLayer(base_url, layer);
      } 
    }
  
    ingest.status = "complete";
    yield ingest.save();
  }
  return ingest;
}

/**
 * @description queries the Map Service for all feature ids for all the features in the layer
 * @param {String} base_url the url for ESRI Map Service
 * @param {Object} layer layer object from a ESRI MapService 
 */
function *getFeatureIds(base_url, layer) {
  var url = [base_url, layer.id, "query"].join("/");
  var params = {
    where:"1=1", 
    f: "pjson", 
    outFields: '*',
    outSR: "4326",
    returnIdsOnly: true
  };
  var ids = yield http_get(url, params);
  ids = ids.objectIds || [];
  return ids;
}

/**
 * @description Process Spans Layer to create or update a Circuit info
 * @param {String} base_url paramDescription
 * @param {Object} layer layer object from a ESRI MapService 
 */
function *processSpansLayer(base_url, layer) {
  var span_ids = yield getFeatureIds(base_url, layer);
  var batch_size = 500;
  var params = {
    where:"1=1", 
    f: "pjson", 
    outFields: '*',
    outSR: "4326",
  };  
  var url = [base_url, layer.id, "query"].join("/");
  var line = {project: dsp_project, url: url};
  for(var i = 0; i <= span_ids.length; i+=batch_size){ 
    var ids = span_ids.slice(i, i+batch_size);
    params.objectIds = ids.join(",");
    var spans = yield http_get(url, params);    
    _.each(spans.features, function(span){
      line.name = sanitizeLineName(span.attributes.LINE_NAME);
      line.voltage = span.attributes.VOLTAGE;
      line.line_number = span.attributes.LINE_NBR;
      line.division = span.attributes.DIVISION;
      line.region = span.attributes.REGION;
      line.length = line.length || 0;
      line.length += span.attributes["SHAPE.STLength()"];
    });
  }
  

  var doc = yield Circuit.findOne({name: line.name});
  if(!doc) {
    yield Circuit.create(line);
    console.log("Created Line", line.name);
  } else {
    if(line.url !== doc.url) {
      doc.url = line.url;
      yield doc.save();
      console.log("Updated Line", line.name);
    }
  }
}

/**
 * @description Process Tree Layer to create or update trees in dispatchr system
 * @param {String} base_url paramDescription
 * @param {Object} layer layer object from a ESRI MapService 
 */
function *processLayer(base_url, layer) {
  var tree_ids = yield getFeatureIds(base_url, layer);
  var tree_count = tree_ids.length;
  console.log("Process Tree Layer", layer.name, layer.id, tree_count);           
  
  
  var params = {
    where:"1=1", 
    f: "pjson", 
    outFields: '*',
    outSR: "4326"
  };
  
  var batch_size = 500;
  var url = [base_url, layer.id, "query"].join("/");
  for(var i = 0; i <= tree_count; i+=batch_size){ 
    var ids = tree_ids.slice(i, i+batch_size);
    params.objectIds = ids.join(",");
    var trees = yield http_get(url, params);    
    assert(trees.features.length === batch_size || i+trees.features.length === tree_count);
    yield processTrees(trees.features);
  }  
}

/**
 * @description Process a list of tree objects 
 * @param {Array} trees An array of tree objects from the Map Service
 */
function *processTrees(trees) {
  var qsi_ids = _.map(trees, function(tree){return tree.attributes.TREEID; });
  var tree_docs = yield TreeV3.find({qsi_id: {$in: qsi_ids}});
  console.log("DB Trees found", tree_docs.length);  
  console.log("Layer Trees", trees.length);
  tree_docs = _.indexBy(tree_docs, "qsi_id");
  for(var i = 0; i < trees.length; i++) {
    var doc = tree_docs[trees[i].attributes.TREEID];
    
    if(doc) {
      var address = {
        streetNumber: doc.streetNumber,
        streetName: doc.streetName,
        city: doc.city,
        county: doc.county,
        state: doc.state,
        zipcode: doc.postal,
      };
    }
    

    var tree = yield translateTree(trees[i], address);
    if(shouldIngest(tree)){
      try{
        if(!doc) {
          doc = yield TreeV3.create(tree);
          console.log("Created Tree", doc.qsi_id);
        } else {
          var doc_pri = detection_priorities[doc.pge_detection_type];
          var tree_pri = detection_priorities[tree.pge_detection_type];
          if(tree_pri < doc_pri) {
          
            console.log("Updated Tree", doc.qsi_id);
            //override particular values (don't override user entered values)
            doc.pge_detection_type = tree.pge_detection_type;
            doc.pge_pmd_num = tree.pge_detection_type;
            doc.span_name = tree.span_name;
            doc.circuit_name = tree.circuit_name;
            doc.save();
          }
        }
      }catch(e) {
        console.error("ERROR", e.message);
        throw(e);
      }
    }
  }
}

var pmd_projects = {};

/**
 * @description Finds a pmd resource or creates if not existing
 * @param {String} pge_pmd_num PMD number  
 */
function *getPMD(pge_pmd_num) {
  if(!pmd_projects[pge_pmd_num]) {
    pmd_projects[pge_pmd_num] = yield PMD.findOne({pge_pmd_num: pge_pmd_num});
  }
  //still don't have it... lookin PMD.csv
  if(!pmd_projects[pge_pmd_num]) {
    pmd_projects[pge_pmd_num] = yield generatePMD(pge_pmd_num);
  }
  return pmd_projects[pge_pmd_num];
}


/**
 * @description create a PMD object from PMD source csv file
 * @param {String} pge_pmd_num PMD number  
 */
function *generatePMD(pge_pmd_num){
  var pmds = yield readPMDCSV("PMD.csv");
  var pmd = pmds[pge_pmd_num];
  return yield PMD.create(pmd);
}

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


/**
 * @description read pmd csv file into object array
 * @param file_path file path to PMD.csv file
 */
function readPMDCSV(file_path){
  return new BPromise(function(resolve, reject){
    var parser = parse({columns: true});    
    var input = fs.createReadStream(file_path);
    input.pipe(parser);
    var projects = {};

    parser.on('readable', function(){
      while(true){
        var record = parser.read();
        if( record ) {
          var id = record["Project ID"].trim();
          var name = record["Project Name"].trim();
          var pi_complete_time = record["Complete Date Plan (PI)"].trim();
          var tc_complete_time = record["Complete Date Plan (Trim)"].trim();
          var division = record["Division Description"].trim();
          var nerc = record.Bnerc.trim() === "1";
          var type = record["Work Category Description"].trim();
          if(projects[id]) {
            if(projects[id].name !== name){
              console.warn("Multiple Project Names for Project", id, name, projects[id]);
            }
          } else {
            projects[id] = {
              name: name,
              pge_pmd_num: id,
              division: division,
              project: dsp_project,
              plan_pi_complete: pi_complete_time,
              plan_tc_complete: tc_complete_time,              
              type: type,
              nerc: nerc
            };
          }
        } else {
          break;
        }
      }
    });
    
    parser.on('end', function(){
      console.log("CSV Count:", _.size(projects));
      resolve(projects);
    });
    parser.on('error', function(error){
      reject(error);
    });
  });
}

/**
 * @description description 
 * @param {Object} tree 
 * @returns {Boolean} true if the tree should be ingested
 */
function shouldIngest(tree) {
  if(_.contains(["VC3c", "VC3p", "VC2p"], tree.pge_detection_type)) {
    return false;
  }
  
  return true;
}

/**
 * @description transforms Map Service Tree into
 */
function *translateTree(tree, address) {
  if(!address) {
    address = yield getAddress(tree.geometry.x, tree.geometry.y);        
  }
  tree = _.extend({}, tree.attributes, {geometry: tree.geometry}, address);
  return yield migrate_util.applyMigrationSchema(migrate_schema, tree);
}




var migrate_schema = {
  status : statusCode,  
  height: "HEIGHT",
  qsi_id: "TREEID",
  circuit_name: function(tree){
    return sanitizeLineName(tree.LINE_NAME);
  },
  pge_pmd_num: "PMD_NUM",
  pge_detection_type: "Priority",
  span_name: "SPAN_NAME",
  location: function(tree){
    return {type: "Point", coordinates: [tree.geometry.x, tree.geometry.y]};
  },  

  division: function*(tree) {
    var pmd = yield getPMD(tree.PMD_NUM);
    return pmd.division;
  },
  region: function*(tree) {
    var pmd = yield getPMD(tree.PMD_NUM);
    return regions[pmd.division];
  },
  
  type: function() {return "tree"; },
  project: function(){ return dsp_project; }, //TODO base of of ingestion project
  streetNumber: "streetNumber",
  streetName: "streetName",
  city: "city",
  county: "county",
  state: "state",
  zipcode: "postal",
  
  updated: function() { return new Date(); },  
  created: function() { return new Date(); }  
};

/**
 * @description cleans up line names to have standard format
 * @param {String} str line name
 * @returns {String} sanitized line name
 */
function sanitizeLineName(str){
  str = str.trim();
  str = str.replace(/[#\(\)\.]/g, "");
  str = str.trim();
  str = str.replace(/[\s-]/g, '_');
  str = str.replace(/&/g, "_");
  str = str.replace(/'/g, "_");    
  str = str.replace(/_+/g, "_");
  str = str.toUpperCase();
  return str;
}

/**
 * @description Calculates the status code string for a tree
 * @param {Object} tree MapService Tree object
 * @returns {String} tree status 
 */
function statusCode(tree){
  var treeFlags = {};  
  treeFlags.status = "left";
  treeFlags.source = "lidar";
  treeFlags.priority = "routine";
  treeFlags.vc_codes = tree.Priority;
  treeFlags.assigned = false;
  treeFlags.dog = false;
  treeFlags.irate_customer = false;
  treeFlags.notify_customer = false;
  treeFlags.ntw_needed = false;
  treeFlags.access_issue = false;
  treeFlags.vehicle_type = null;
  treeFlags.environment = null;
  return TreeStates.fetchStatusCode(treeFlags);
}





if (require.main === module) {
  var baker = require('dsp_shared/lib/baker');
  utils.bakerGen(run, {default:true});  
  utils.bakerGen(function *treeAddress(tree_id){
    var tree = yield TreeV3.findOne({_id: tree_id});
    var address = yield getAddress(tree.location.coordinates[0], tree.location.coordinates[1]);
    return address;
  });
  baker.run();  
}