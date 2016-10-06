var log = require('dsp_config/config').get().getLogger('['+__filename+']');
var util = require('./util');
var http_get = util.http_get;


var FeatureService = function (url) {
  this.base_url = url;
};

FeatureService.prototype.intersect = function*(location) {
  var url = this.base_url+"/query";
  var data = null;
  if(location && location.coordinates) { //TODO throw an excpetion bad input
    var query = {
      geometry: location.coordinates[0]+","+location.coordinates[1],
      geometryType:"esriGeometryPoint",
      spatialRel: "esriSpatialRelIntersects",
      inSR: 4326,
      f: "json"
    };
    data = yield http_get(url, query);
    // log.debug("DID HTTP REQUEST", url, query, data);
  }
  return data;
};

module.exports = FeatureService;