var utils = require('dsp_shared/lib/cmd_utils');
utils.connect(['meteor']);
require("sugar");
var TreeV3 = require("dsp_shared/database/model/tree");
var esri_util = require("dsp_shared/lib/gis/esri_util");
var http_get = esri_util.http_get;


/**
 * run runs the script to correct the qsi_field values
 * @param {boolean} push         boolean to start updating
 * @param {string} qsi_field   field name for qsi schema
 * @param {string} dispatchr_field   field name for meteor schema
 * @yield {Array}}  retrun from mongo
 */
 function *run(push) {
  push = push || false;
  var host = "https://esri.dispatchr.co:6443";
  var base_params = {
  "where": null,
  "text": null,
  "objectIds": null,
  "time": null,
  "geometry": "-118.11904498022816,34.48885856409852",
  "geometryType": "esriGeometryPoint",
  "inSR": "4326",
  "spatialRel": "esriSpatialRelWithin",
  "relationParam": null,
  "outFields": "*",
  "returnGeometry": "true",
  "maxAllowableOffset": null,
  "geometryPrecision": null,
  "outSR": "4326",
  "returnIdsOnly": "false",
  "returnCountOnly": "false",
  "orderByFields": null,
  "groupByFieldsForStatistics": null,
  "outStatistics": null,
  "returnZ": "false",
  "returnM": "false",
  "gdbVersion": null,
  "returnDistinctValues": "false",
  "f": "pjson"
};

  var trees = yield TreeV3.find({status:/^1/}).select('location').limit(100).exec();
  console.time('query');
  for (var i = 0; i < trees.length; i++) {
  	var tree = trees[i];
  	var geometry = tree.location.coordinates[0].toString() + "," + tree.location.coordinates[1].toString();
  	console.log(geometry);
  	base_params.geometry = geometry;
  	var service_path = ["/arcgis/rest/services", 'PGE_RIPARIAN', "MapServer", 0,"query"].join("/");
  	var base_url = [host, service_path].join('/');
  	console.log("service url PATH", base_url);
  	var service = yield http_get(base_url, base_params);
  	console.log(">>>>>>>>>>>>>>>>>", service.features.length);
  	if(service.features.length > 1){
  		console.log(' FOUND IN RIPERIAN ZONE');
  		if(push){
  			yield TreeV3.update({ _id: tree._id },{ $set: { riparian: true } });
  		}
  	} else {
  		console.log('NOT FOUND IN RIPERIAN ZONE');
  		if(push){
  			yield TreeV3.update({ _id: tree._id },{ $set: { riparian: false } });
  		}
  	}
  }
  	console.timeEnd('query');

}


module.exports = run;
 
if (require.main === module) {
  var baker = require('dsp_shared/lib/baker');
  utils.bakerGen(run, {default:true}); 
  baker.run();  
}