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
var Line = require("dsp_shared/database/model/circuit");
var esri_util = require("dsp_shared/lib/gis/esri_util");
var _ = require('underscore');
var http_get = esri_util.http_get;
var fs = require('fs');
var query = {
		where: '1=1',
		geometryType: 'esriGeometryEnvelope',
		spatialRel: 'esriSpatialRelIntersects',
		outFields: 'PMD_NUM,SPAN_NAME,TREEID',
		returnGeometry: true,
		returnIdsOnly: false,
		returnM: false,
		returnZ: false,
		returnDistinctValues: false,
		f: 'pjson'
};

var fieldsDict = {
	line: 'Spans',
	tree: 'TreeTops'
};

var nameField = {
	line: 'name',
	tree: 'circuit_name'
};

var collection_model = {
  line: Line,
  tree: TreeV3
};

var invalid_lines = [];

function write_to_file(in_lines){
	fs.writeFile(__dirname + "/invalid_lines.json", JSON.stringify(in_lines) , function(err) {
		if(err) {
			return console.log(err);
		}

		console.log("The file was saved!");
	}); 
}

/**
 * [*query_db query meteor db for invalid values
 * @param {string} collection      collection to be queries
 * @param {string} dispatchr_field meteor schema field
 * @param {object}} options         
 * @yield {Promise} database query 
 */
function *query_db(collection, dispatchr_field, options){
	if(!options){
		options = {};
	}
	var docs_missing_field;
	if( collection === 'tree'){
 		if( dispatchr_field === 'pge_pmd_num'){
 			docs_missing_field = yield TreeV3.find({pge_pmd_num: null , 
 				project:"transmission_2015",
 				qsi_id:{ 
 					$ne:null 
 				}
 			},
 			{ 
 				qsi_id:1, 
 				circuit_name:1, 
 				pge_pmd_num:1
 			}).exec();
 		}
 		else{
 			docs_missing_field = yield TreeV3.find({span_name: null , 
 				project:"transmission_2015",
 				qsi_id:{ 
 					$ne:null 
 				}
 			},
 			{ 
 				qsi_id:1, 
 				circuit_name:1, 
 				pge_pmd_num:1
 			}).exec();
 		}
 	}
 	if( collection === 'line' ){
 		var q = {};
 		q.project = 'transmission_2015';
 		q[dispatchr_field] = null;
 		docs_missing_field = yield Line.find(q).exec();
 	}
 	return docs_missing_field;
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
 	var docs_missing_field = yield query_db(collection, dispatchr_field);
 	
 	

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
  for (var i = 0; i < docs_missing_field.length; i++) {
  	var doc_missing_field = docs_missing_field[i];
  	var circuit_found = false;
  	for(var g = 0; g < folder.services.length; g++){
  		service_path = ["arcgis/rest/services", folder.services[g].name, "MapServer"].join("/");
  		base_url = [host, service_path].join('/');
  		var service_current = folder.services[g].layers_circuits.layers;
  		for(var m = 0 ; m < service_current.length; m++) {
  			var layer_group = service_current[m];
  			if( layer_group.name.indexOf(doc_missing_field[nameField[collection]]) > -1 && 
  				layer_group.name.endsWith(fieldsDict[collection]) ){
  				circuit_found = true;
  				yield processLayer(base_url, collection, layer_group, doc_missing_field , push, qsi_field, dispatchr_field);
  			}
  		}
  	}
  }
  write_to_file(invalid_lines);
}

/**
 * *processLayer goes one layer at a time generates the query
 * @param {strind} base_url          contains the services
 * @param {object} layer             contains the layer information
 * @param {object}  tree to be updated
 * @param {boolean} push              boolean to start updating 
 * @param {string} qsi_field   field name for qsi schema	
 * @param {string} dispatchr_field   field name for meteor schema
 * @yield {object} http yield for 
 */
function *processLayer(base_url, collection, layer, doc_missing_field , push, qsi_field, dispatchr_field) {     
  var url = [base_url, layer.id, "query"].join("/");
  if(collection === 'tree'){
  	query.where =  "TREEID='" + doc_missing_field.qsi_id + "'";
  }
  else if(collection === 'line'){
  	query.where = '1=1';
  	query.outFields = '*';
  }
  var trees = yield http_get(url, query); 
  assert(trees.features);
  yield process_trees(layer, collection, { features: [trees.features[0]] }, push, doc_missing_field, qsi_field, dispatchr_field);

}

/**
 * *process_trees processes trees by looking into the databases
 * @param {array} trees         array of trees
 * @param {string} qsi_field   field name for qsi schema
 * @param {string} dispatchr_field   field name for meteor schema
 * @yield {Array} yield from mongo datavases
 */
function *process_trees(layer, collection, trees, push, doc_missing_field, qsi_field, dispatchr_field){

	var trees_new = _.chain(trees.features).pluck('attributes').each(tree => { return tree;}).value();
	var oldValue = doc_missing_field;
	var newValue = trees_new;
	var set = {};
	set[dispatchr_field] = newValue[0][qsi_field]; 
	if(newValue[0][qsi_field]){
		console.log(collection, ' will be updated , old: ',oldValue,  '  new value: ', newValue, 'set: ', set);
	}
	if(!newValue[0][qsi_field]){
		invalid_lines.push({ id: layer.id, name: layer.name});
	}
	if(push && newValue[0][qsi_field]){
		console.log(collection, ' updating , old: ',oldValue,  '  new value: ', newValue, 'set: ', set);
    yield collection_model[collection].update({_id: oldValue._id }, { $set: set }).exec();
	}
}

module.exports = run;
 
if (require.main === module) {
  var baker = require('dsp_shared/lib/baker');
  utils.bakerGen(run, {default:true}); 
  baker.run();  
}