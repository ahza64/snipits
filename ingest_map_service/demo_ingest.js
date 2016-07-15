#!/bin/env node
/*
  @author Gabriel Littman
  @fileoverview arcgis ingest command that will ingest transmission trees, lines, and project data
*/
// var co = require('co');
var utils = require('dsp_shared/lib/cmd_utils');
utils.connect();
var service_iterator = require('./service_iterator');
var TreeStates = require('tree-status-codes');
var geocode = require("dsp_shared/lib/gis/google_geocode");
var _ = require('underscore');
var migrate_util = require('dsp_shared/lib/migrate');

var TreeV3 = require("dsp_shared/database/model/tree");
var PMD = require('dsp_shared/database/model/pmd');
var Circuit = require('dsp_shared/database/model/circuit');


var dsp_project = "transmission_2015";
var circuit_name = sanitizeLineName("San Francisco Demo Line");
var pmd_name = "SF Demo Project";
var pge_pmd_num = "12345GAS";

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

var migrate_schema = {
  status : statusCode,
  height: "EstHeight_",
  qsi_id: "Name",
  circuit_name: function*(){
    var circuit = yield Circuit.findOne({name: circuit_name});
    if(!circuit) {
      yield Circuit.create({
        name: circuit_name,
        url: "https://esri.dispatchr.co:6443/arcgis/rest/services/GAS_DEMO/SAN_FRANCISCO_DEMO/MapServer/0", 
        project: dsp_project
      });
    }
    
  },
  pge_pmd_num: function*(){
    var pmd = yield PMD.findOne({pge_pmd_num: pge_pmd_num});
    if(!pmd) {
      yield PMD.create({
        pge_pmd_num: pge_pmd_num,
        name: pmd_name,
        project: dsp_project,
        type: "System Maintenance"
      });
    }
    return pge_pmd_num;
  },
  location: function(tree){
    return {type: "Point", coordinates: [tree.geometry.x, tree.geometry.y]};
  },

  division: function() {
    return "Peninsula";
  },
  region: function() {
    return "South";
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


function *run() {
  var base_url = "https://esri.dispatchr.co:6443/arcgis/rest/services/GAS_DEMO/SAN_FRANCISCO_DEMO/MapServer"; 
  var layer = {
    id: 0,
    name: "SAN_FRANCISCO_TreeTops",
    parentLayerId: -1,
    defaultVisibility: true,
    subLayerIds: null,
    minScale: 0,
    maxScale: 0
  };
  var i = 0;


  for(var tree_prom of service_iterator.featureIter(base_url, layer)) {
    var tree = yield tree_prom;
    var doc = yield TreeV3.findOne({qsi_id: tree.attributes.Name});
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
    if(!address) {
      address = yield geocode.getAddress(tree.geometry.x, tree.geometry.y);        
    }
    tree = _.extend({}, tree.attributes, {geometry: tree.geometry}, address);
    tree = yield migrate_util.applyMigrationSchema(migrate_schema, tree);
    
    console.log("feature", i++, tree);
    
    
    
    if(!doc) {
      doc = yield TreeV3.create(tree);
      console.log("Created Tree", doc.qsi_id);
    } else {
      var doc_pri = detection_priorities[doc.pge_detection_type];
      var tree_pri = detection_priorities[tree.pge_detection_type];

      if(tree_pri < doc_pri || doc.circuit_name === tree.circuit_name && 
        (tree.pge_pmd_num !== doc.pge_pmd_num || tree.division !== doc.division)) {
        console.log("Updated Tree", doc.qsi_id);
        //override particular values (don't override user entered values)
        doc.pge_detection_type = tree.pge_detection_type;
        doc.division = tree.division;
        doc.pge_pmd_num = tree.pge_pmd_num;
        doc.span_name = tree.span_name;
        doc.circuit_name = tree.circuit_name;
        yield doc.save();
      }
    }    
  }      
}


if (require.main === module) {
  var baker = require('dsp_shared/lib/baker');
  utils.bakerGen(run, {default:true});  
  baker.run();  
}
