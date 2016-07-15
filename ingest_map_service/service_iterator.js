var co = require('co');
var esri_util = require("dsp_shared/lib/gis/esri_util");
var http_get = esri_util.http_get;
var assert = require('assert');
var co_iterator = require("./co_iterator");
// function *iterGroup(base_url, service, layer_group){
//   console.log("check ingested", {name: layer_group.name, script: "arcgis_ingest", status: "complete"});
//   var ingest = yield Ingest.findOne({name: layer_group.name, script: "arcgis_ingest", status: "complete"}).sort({date: -1});
//   if(ingest && !force) {
//     console.log("Layer group previously ingested", layer_group.name);
//   } else {
//     console.log("Ingesting...", layer_group.name);
//     ingest = yield Ingest.create({
//       name: layer_group.name,
//       status: "running",
//       script: "arcgis_ingest",
//       date: new Date()
//     });
//
//     console.log("LAYER GROUP", layer_group.name, layer_group.id);
//     for(var j = 0; j < layer_group.subLayerIds.length; j++) {
//       var layer_id = layer_group.subLayerIds[j];
//       console.log("LAYERS", layer_id);
//       var layer = service.layers[layer_id];
//     }
//
//     ingest.status = "complete";
//     yield ingest.save();
//   }
//   return ingest;
// }
//
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
  console.log('url', url, params);
  var ids = yield http_get(url, params);
  ids = ids.objectIds || [];
  return ids;
}

/**
 * @param {String} base_url The url of hte map service
 * @param {Object} layer layer object from a map service 
 * 
 * Layer = {
 *   id: 0,
 *   name: "SAN_FRANCISCO_TreeTops",
 *   parentLayerId: -1,
 *   defaultVisibility: true,
 *   subLayerIds: null,
 *   minScale: 0,
 *   maxScale: 0
 *   }
 */
function featureIter(base_url, layer) {
  
  return co_iterator(function*(handleNext){
    var feature_ids = yield getFeatureIds(base_url, layer);
    var feature_count = feature_ids.length;
    console.log("Process Tree Layer", layer.name, layer.id, feature_count);           
    var params = {
      where:"1=1", 
      f: "pjson", 
      outFields: '*',
      outSR: "4326"
    };

    var batch_size = 500;
    var url = [base_url, layer.id, "query"].join("/");
    for(var i = 0; i <= feature_count; i+=batch_size){ 
      var ids = feature_ids.slice(i, i+batch_size);
      params.objectIds = ids.join(",");    
      var response = yield http_get(url, params);    
      assert(response.features.length === batch_size || i+response.features.length === feature_count);
      console.log('getting features', url, params, response.features.length);
      for(var j = 0; j < response.features.length; j++) {
        yield handleNext(response.features[j]);
      }    
    } 
  });
}




function test() {
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
  co(function*(){
    var i = 0;
    for(var feature_p of featureIter(base_url, layer)) {
      var feature = yield feature_p;
      console.log("feature", i++, feature);
    }      
  });
}


if (require.main === module) {
  var baker = require('dsp_shared/lib/baker');
  baker.command(test, {default:true});  
  baker.run();  
}


module.exports = {
  featureIter: featureIter
};