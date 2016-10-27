var co = require('co');
var esri_util = require("dsp_shared/lib/gis/esri_util");
var http_get = esri_util.http_get;
var assert = require('assert');
var co_iterator = require("dsp_shared/lib/co_iterator");


function groupIter(base_url, service, layer_group) {
  return co_iterator(function*(handleNext){
    console.log("LAYER GROUP", layer_group.name, layer_group.id, layer_group.subLayerIds.length);
    for(var j = 0; j < layer_group.subLayerIds.length; j++) {
      var layer_id = layer_group.subLayerIds[j];
      console.log("LAYER ID", layer_id);
      var layer = service.layers[layer_id];
    
      for(var feature of featureIter(base_url, layer) ) {
        console.log("HHH")
        feature = yield feature;
        // console.log("feature", feature)
        yield handleNext(feature);
        // console.log("CONTINUE")
      }
      // console.log("SDFD", j);
    }
  });
}
 

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
        console.log("FEATURE>>>>>>>>>>>", j)
        yield handleNext(response.features[j]);
      }    
    }
    console.log("GEN DONE");
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


function test2() {
 var url = "https://esri.dispatchr.co:6443/arcgis/rest/services/RCA_TRANSMISSION_2015/TRANS_70_DELIVERY_1_UPDATE/MapServer";
 co(function*(){
  for(var feature of groupIter(url, service, service.layers[0])) {
    console.log("GO")
    feature = yield feature;
    console.log("feature", feature);
  }  
 }).catch(function(e){
   console.log("ERROR", e);
 });
}


module.exports = {
  featureIter: featureIter,
  groupIter: groupIter,
};


var service = {
 "currentVersion": 10.21,
 "serviceDescription": "transmission",
 "mapName": "Layers",
 "description": "",
 "copyrightText": "",
 "supportsDynamicLayers": false,
 "layers": [
  {
   "id": 0,
   "name": "TRANS_70_DELIVERY_1_UPDATE",
   "parentLayerId": -1,
   "defaultVisibility": true,
   "subLayerIds": [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    21,
    22,
    23,
    24,
    25,
    26,
    27,
    28,
    29,
    30,
    31,
    32,
    33,
    34,
    35,
    36,
    37,
    38,
    39,
    40,
    41,
    42,
    43,
    44,
    45,
    46,
    47,
    48,
    49,
    50,
    51,
    52,
    53,
    54,
    55,
    56,
    57,
    58,
    59,
    60,
    61,
    62,
    63,
    64,
    65,
    66,
    67,
    68,
    69,
    70,
    71
   ],
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 1,
   "name": "VALLEY_SPRINGS_MARTELL_1_60kV_Towers",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 2,
   "name": "VALLEY_SPRINGS_CLAY_60kV_TreeTops",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 3,
   "name": "VALLEY_SPRINGS_CLAY_60kV_Towers",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 4,
   "name": "WEIMAR_HALSEY_60kV_TreeTops",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 5,
   "name": "WEIMAR_HALSEY_60kV_Towers",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 6,
   "name": "SOBRANTE_R_2_115kV_TreeTops",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 7,
   "name": "SOBRANTE_R_2_115kV_Towers",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 8,
   "name": "SOBRANTE_R_1_115kV_TreeTops",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 9,
   "name": "SOBRANTE_R_1_115kV_Towers",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 10,
   "name": "SOBRANTE_GRIZZLY_CLAREMONT_2_115kV_TreeTops",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 11,
   "name": "SOBRANTE_GRIZZLY_CLAREMONT_2_115kV_Towers",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 12,
   "name": "SOBRANTE_GRIZZLY_CLAREMONT_1_115kV_TreeTops",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 13,
   "name": "SOBRANTE_GRIZZLY_CLAREMONT_1_115kV_Towers",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 14,
   "name": "SOBRANTE_G_2_115kV_TreeTops",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 15,
   "name": "SOBRANTE_G_2_115kV_Towers",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 16,
   "name": "SOBRANTE_G_1_115kV_TreeTops",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 17,
   "name": "SOBRANTE_G_1_115kV_Towers",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 18,
   "name": "PITTSBURG_MARTINEZ_2_115kV_TreeTops",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 19,
   "name": "PITTSBURG_MARTINEZ_2_115kV_Towers",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 20,
   "name": "PITTSBURG_MARTINEZ_1_115kV_TreeTops",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 21,
   "name": "PITTSBURG_MARTINEZ_1_115kV_Towers",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 22,
   "name": "PARDEE_1_TAP_60kV_TreeTops",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 23,
   "name": "PARDEE_1_TAP_60kV_Towers",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 24,
   "name": "OLEUM_NORTH_TOWER_CHRISTIE_115kV_TreeTops",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 25,
   "name": "OLEUM_NORTH_TOWER_CHRISTIE_115kV_Towers",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 26,
   "name": "OLEUM_MARTINEZ_115kV_TreeTops",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 27,
   "name": "OLEUM_MARTINEZ_115kV_Towers",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 28,
   "name": "OLEUM_G_1_115kV_TreeTops",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 29,
   "name": "OLEUM_G_2_115kV_TreeTops",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 30,
   "name": "OLEUM_G_2_115kV_Towers",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 31,
   "name": "OLEUM_G_1_115kV_Towers",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 32,
   "name": "MISSOURI_FLAT_GOLD_HILL_2_115kV_TreeTops",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 33,
   "name": "MISSOURI_FLAT_GOLD_HILL_2_115kV_Towers",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 34,
   "name": "MISSOURI_FLAT_GOLD_HILL_1_115kV_TreeTops",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 35,
   "name": "MISSOURI_FLAT_GOLD_HILL_1_115kV_Towers",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 36,
   "name": "MARTINEZ_SOBRANTE_115kV_TreeTops",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 37,
   "name": "MARTINEZ_SOBRANTE_115kV_Towers",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 38,
   "name": "EL_DORADO_MISSOURI_FLAT_2_115kV_TreeTops",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 39,
   "name": "EL_DORADO_MISSOURI_FLAT_2_115kV_Towers",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 40,
   "name": "DEEPWATER_2_TAP_115kV_TreeTops",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 41,
   "name": "DEEPWATER_2_TAP_115kV_Towers",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 42,
   "name": "COLGATE_GRASS_VALLEY_60kV_TreeTops",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 43,
   "name": "COLGATE_GRASS_VALLEY_60kV_Towers",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 44,
   "name": "COLGATE_ALLEGHANY_60kV_TreeTops",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 45,
   "name": "COLGATE_ALLEGHANY_60kV_Towers",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 46,
   "name": "CHINESE_CAMP_ULTRA_POWER_TAP_115kV_TreeTops",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 47,
   "name": "CHINESE_CAMP_ULTRA_POWER_TAP_115kV_Towers",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 48,
   "name": "VALLEY_SPRINGS_MARTELL_1_60kV_Spans",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 49,
   "name": "VALLEY_SPRINGS_CLAY_60kV_Spans",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 50,
   "name": "DEEPWATER_2_TAP_115kv_Spans",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 51,
   "name": "WEIMAR_HALSEY_60kV_Spans",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 52,
   "name": "SOBRANTE_R_2_115kV_Spans",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 53,
   "name": "SOBRANTE_R_1_115kV_Spans",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 54,
   "name": "SOBRANTE_GRIZZLY_CLAREMONT_2_115kV_Spans",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 55,
   "name": "SOBRANTE_GRIZZLY_CLAREMONT_1_115kV_Spans",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 56,
   "name": "SOBRANTE_G_2_115kV_Spans",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 57,
   "name": "SOBRANTE_G_1_115kV_Spans",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 58,
   "name": "PITTSBURG_MARTINEZ_2_115kV_Spans",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 59,
   "name": "PITTSBURG_MARTINEZ_1_115kV_Spans",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 60,
   "name": "PARDEE_1_TAP_60kV_Spans",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 61,
   "name": "OLEUM_NORTH_TOWER_CHRISTIE_115kV_Spans",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 62,
   "name": "OLEUM_MARTINEZ_115kV_Spans",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 63,
   "name": "OLEUM_G_2_115kV_Spans",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 64,
   "name": "OLEUM_G_1_115kV_Spans",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 65,
   "name": "MISSOURI_FLAT_GOLD_HILL_2_115kV_Spans",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 66,
   "name": "MISSOURI_FLAT_GOLD_HILL_1_115kV_Spans",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 67,
   "name": "MARTINEZ_SOBRANTE_115kV_Spans",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 68,
   "name": "EL_DORADO_MISSOURI_FLAT_2_115kV_Spans",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 69,
   "name": "COLGATE_GRASS_VALLEY_60kV_Spans",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 70,
   "name": "COLGATE_ALLEGHANY_60kV_Spans",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  },
  {
   "id": 71,
   "name": "CHINESE_CAMP_ULTRA_POWER_TAP_115kV_Spans",
   "parentLayerId": 0,
   "defaultVisibility": true,
   "subLayerIds": null,
   "minScale": 0,
   "maxScale": 0
  }
 ],
 "tables": [],
 "spatialReference": {
  "wkid": 103005,
  "latestWkid": 103005
 },
 "singleFusedMapCache": false,
 "initialExtent": {
  "xmin": 6565539.309701192,
  "ymin": 2140533.45057674,
  "xmax": 6572841.578486157,
  "ymax": 2150443.6724991924,
  "spatialReference": {
   "wkid": 103005,
   "latestWkid": 103005
  }
 },
 "fullExtent": {
  "xmin": 6041183.850174591,
  "ymin": 2135536.9329832494,
  "xmax": 6570506.409965679,
  "ymax": 2725790.6514235884,
  "spatialReference": {
   "wkid": 103005,
   "latestWkid": 103005
  }
 },
 "minScale": 0,
 "maxScale": 0,
 "units": "esriFeet",
 "supportedImageFormatTypes": "PNG32,PNG24,PNG,JPG,DIB,TIFF,EMF,PS,PDF,GIF,SVG,SVGZ,BMP",
 "documentInfo": {
  "Title": "",
  "Author": "",
  "Comments": "",
  "Subject": "",
  "Category": "",
  "AntialiasingMode": "None",
  "TextAntialiasingMode": "Force",
  "Keywords": "Transmissions"
 },
 "capabilities": "Map,Query,Data",
 "supportedQueryFormats": "JSON, AMF",
 "exportTilesAllowed": false,
 "maxRecordCount": 1000,
 "maxImageHeight": 4096,
 "maxImageWidth": 4096,
 "supportedExtensions": "KmlServer"
};

if (require.main === module) {
  var baker = require('dsp_shared/lib/baker');
  baker.command(test, {default:true});  
  baker.command(test2);  
  baker.run();  
}
