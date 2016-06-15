#!/bin/env node
/*
  @author tw3rp
  @fileoverview ingests span data into meteor database
*/
var utils = require('dsp_shared/lib/cmd_utils');
utils.connect(['meteor']);
var TreeV3 = require("dsp_shared/database/model/tree");
var esri_util = require("dsp_shared/lib/gis/esri_util");
var _ = require('underscore');
var http_get = esri_util.http_get;
require('sugar');

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

/**
 * run runs the script to correct the unknown values
 * @param {boolean} push         boolean to start updating
 * @param {string} unknown   field name for qsi schema
 * @param {string} unknown_meteor   field name for meteor schema
 * @yield {Array}}  retrun from mongo
 */
function *run(unknown, unknown_meteor, push) {
  push = push || false;
  console.log("run", unknown, unknown_meteor, push)
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
	var trees_without_spans;
	if( unknown_meteor === 'pge_pmd_num'){
		trees_without_spans = yield TreeV3.find({pge_pmd_num:{$regex: /^V/} , 
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
		trees_without_spans = yield TreeV3.find({span_name: null , 
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
  for (var i = 0; i < trees_without_spans.length; i++) {
  	var tree_without_span = trees_without_spans[i];
  	var circuit_found = false;
  	for(var g = 0; g < folder.services.length; g++){
  		service_path = ["/arcgis/rest/services", folder.services[g].name, "MapServer"].join("/");
  		base_url = [host, service_path].join('/');
  		var service_current = folder.services[g].layers_circuits.layers;
  		for(var m = 0 ; m < service_current.length; m++) {
  			var layer_group = service_current[m];
  			if( layer_group.name.indexOf(tree_without_span.circuit_name) > -1 && layer_group.name.endsWith('TreeTops')){
  				circuit_found = true;
  				yield processLayer(base_url, layer_group, tree_without_span, push, unknown, unknown_meteor);
  			}
  		}
  	}
  }
}

/**
 * *processLayer goes one layer at a time generates the query
 * @param {strind} base_url          contains the services
 * @param {object} layer             contains the layer information
 * @param {object} tree_without_span tree to be updated
 * @param {boolean} push              boolean to start updating 
 * @param {string} unknown   field name for qsi schema
 * @param {string} unknown_meteor   field name for meteor schema
 * @yield {object} http yield for 
 */
function *processLayer(base_url, layer, tree_without_span, push, unknown, unknown_meteor) {     
  var url = [base_url, layer.id, "query"].join("/");
  query.where = "TREEID='" + tree_without_span.qsi_id + "'";
  console.log("Checking layer", tree_without_span.circuit_name, " >>> ", base_url, layer.name, tree_without_span.qsi_id)
  var trees = yield http_get(url, query);    
  yield process_trees(trees, push, tree_without_span, unknown, unknown_meteor);
}

/**
 * *process_trees processes trees by looking into the databases
 * @param {array} trees         array of trees
 * @param {string} unknown   field name for qsi schema
 * @param {string} unknown_meteor   field name for meteor schema
 * @yield {Array} yield from mongo datavases
 */
function *process_trees(trees, push, tree_without_span, unknown, unknown_meteor){

	var trees_new = _.chain(trees.features).pluck('attributes').each(tree => { console.log(tree); return tree;}).value();
	var oldValue = tree_without_span;
	var newValue = trees_new;
	var set = {};
	set[unknown_meteor] = newValue[0][unknown]; 
	console.log('trees will be updated , old: ',oldValue,  '  new value: ', newValue, 'set: ', set);

	if(push){
    console.log('updating', oldValue._id, 'set: ', set);
		yield TreeV3.update({_id: oldValue._id }, { $set: set }).exec();
	}
}


if (require.main === module) {
  var baker = require('dsp_shared/lib/baker');
  utils.bakerGen(run, {default:true}); 
  baker.run();  
}