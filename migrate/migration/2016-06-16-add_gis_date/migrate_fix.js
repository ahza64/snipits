#!/bin/env node
/*
  @author tw3rp
  @fileoverview ingests span data into meteor database
  */
  var utils = require('dsp_shared/lib/cmd_utils');
  utils.connect(['meteor']);
  require("sugar");
  var TreeV3 = require("dsp_shared/database/model/tree");
  var assert = require('assert');
  var esri_util = require("dsp_shared/lib/gis/esri_util");
  var _ = require('underscore');
  var http_get = esri_util.http_get;

  var fieldsDict = {
   line: 'Spans',
   tree: 'TreeTops'
 };

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
 * find_and_update_tree find trees in meteor db using qsiId and circuit name 
 * @param {Array} line_names         Array of line names uniqued from the layer 
 * @param {Array} trees              Array of trees from the layer 
 * @param {object} qsi_ids_with_dates Array of IDS and and dates embedded
 * @param {object} layer              layer object from the layer
 * @param {boolean} push              check to update the database
 * @yield {Promise} update the database
 */
function *find_and_update_tree(line_names,trees, qsi_ids_with_dates, layer, push){
  for(var k=0; k<line_names.length; k++ ){
    var line_name = sanitizeLineName(line_names[k]);
    for(var dte in qsi_ids_with_dates){
      var qsi_ids = _.pluck(qsi_ids_with_dates[dte], 'TREEID');
      var tree_docs = yield TreeV3.find({qsi_id: {$in: qsi_ids}, circuit_name: line_name, acq_date:null}, {_id:1});
      console.log("DB Trees found", tree_docs.length);
      console.log("Layer Trees", qsi_ids.length, line_name, dte, layer); 
      var tree_ids = _.pluck(tree_docs, '_id');
      var dte_obj = new Date(parseInt(dte));
      console.log(tree_ids.length, " trees will be updated with date ", dte_obj);
      if(tree_docs.length > 0 && push){
        console.log('updating ',tree_ids.length, " trees with date ", dte_obj);
        yield TreeV3.update({ _id: {$in: tree_ids }},{ $set: { acq_date: dte_obj}}, {multi: true}).exec();
      }  
    }
  }
}




function *processTrees(trees, layer, push) {
  //var qsi_ids = _.map(trees, function(tree){return tree.attributes.TREEID; });
  var qsi_ids_with_dates = _.chain( trees )
    .pluck( 'attributes' )
    .map( tree => { return { ACQ_DATE: tree.ACQ_DATE, TREEID: tree.TREEID}; })
    .groupBy( tree => tree.ACQ_DATE ).value();
  var line_names = _.chain(trees).map(function(tree){return tree.attributes.LINE_NAME; }).uniq().value();
  yield find_and_update_tree(line_names,trees, qsi_ids_with_dates, layer, push);
}


/**
 * @description Process Tree Layer to create or update trees in dispatchr system
 * @param {String} base_url paramDescription
 * @param {Object} layer layer object from a ESRI MapService 
 */
function *processLayer(base_url, collection, layer, push) {
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
    yield processTrees(trees.features, layer, push);
  }  
}

/**
 * run runs the script to correct the qsi_field values
 * @param {boolean} push         boolean to start updating
 * @param {string} qsi_field   field name for qsi schema
 * @param {string} dispatchr_field   field name for meteor schema
 * @yield {Array}}  retrun from mongo
 */
 function *run(collection, qsi_field, dispatchr_field, push) {
  push = push || false;
  var dsp_project = 'transmission_2015';
  var project = dsp_project.toUpperCase();
  var host = "https://esri.dispatchr.co:6443";
  var folder_path = ["/arcgis/rest/services", project].join("/");
  var base_params = {
    f: "pjson"
  };
  console.log("folder", folder_path);
  var base_url = [host, folder_path].join('/');  
  console.log("FOLDER", base_url);  
  var folder = yield http_get(base_url, base_params);  
  
  

  for(var s = 0; s < folder.services.length; s++){
    var service = folder.services[s];
    console.log("service", folder.services[s]);
    var service_path = ["/arcgis/rest/services", service.name, "MapServer"].join("/");
    base_url = [host, service_path].join('/');
    console.log("service url PATH", base_url);
    service = yield http_get(base_url, base_params);
    console.log(">>>>>>>>>>>>>>>>>");
    folder.services[s].layers_circuits = service;
  }

  for(var g = 0; g < folder.services.length; g++){
    service_path = ["arcgis/rest/services", folder.services[g].name, "MapServer"].join("/");
    base_url = [host, service_path].join('/');
    var service_current = folder.services[g].layers_circuits.layers;
    for(var m = 0 ; m < service_current.length; m++) {
      var layer_group = service_current[m];
      if(layer_group.name.endsWith(fieldsDict[collection] ) ){
          yield processLayer(base_url, collection, layer_group, push, qsi_field, dispatchr_field);
      } 
    }
  }
}


module.exports = run;
 
if (require.main === module) {
  var baker = require('dsp_shared/lib/baker');
  utils.bakerGen(run, {default:true}); 
  baker.run();  
}