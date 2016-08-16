var utils = require('dsp_shared/lib/cmd_utils');
utils.connect(['meteor']);
require("sugar");
var TreeV3 = require("dsp_shared/database/model/tree");
var esri_util = require("dsp_shared/lib/gis/esri_util");
var http_get = esri_util.http_get;

String.prototype.replaceAt=function(index, character) {
    character = character.toString();
    return this.substr(0, index) + character + this.substr(index+character.length);
};

const ENV_INDEX = 12;

const NONE        = 0;
const RIPARIAN    = 1;
// const VELB        = 2;
// const RAPTOR_NEST = 3;
// const OTHER       = 4;


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

  var trees = yield TreeV3.find({status:/^1/}).select('location status').exec();
  console.time('query');  
  for (var i = 0; i < trees.length; i++) {
    if(i%100 === 0) {
      console.log("Checking Trees: ", i, "of", trees.length);
    }
  	var tree = trees[i];
  	var geometry = tree.location.coordinates[0].toString() + "," + tree.location.coordinates[1].toString();
  	base_params.geometry = geometry;
  	var service_path = ["/arcgis/rest/services", 'PGE_RIPARIAN', "MapServer", 0,"query"].join("/");
  	var base_url = [host, service_path].join('/');
  	var service = yield http_get(base_url, base_params);
    var status = tree.status;        
  	if(service.features.length > 0){
  		console.log(' FOUND IN RIPERIAN ZONE', tree._id, geometry);
      status = status.replaceAt(ENV_INDEX, RIPARIAN);//set as reparian
  	} else {
      status = status.replaceAt(ENV_INDEX, NONE);//unset flag
  	}
		if(push){        
			yield TreeV3.update({ _id: tree._id },{$set: {status: status}, $unset: { riparian: "" } });
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
