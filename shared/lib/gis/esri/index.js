
var Route = require("dsp_lib/gis/esri/route");
var Routing = require("dsp_lib/gis/esri/routing");

module.exports.Route = Route;
module.exports.Routing = Routing;
module.exports.EsriToken = require("dsp_lib/gis/esri/token");
module.exports.FeatureService = require('dsp_lib/gis/esri/feature_service');
module.exports.Geocoding = require("dsp_lib/gis/esri/geocode");

if (require.main === module) {
  var co = require("co");
  co(function*(){ 
    var sha1 = process.argv[2];
    var route = yield Route.load_by_sha1(sha1);
    
    // var type = process.argv[3];
    // var data = yield Routing.getResults(route, type);
    
    var data = yield Routing.retrieve_job(route);
    console.log(JSON.stringify(data));
  })();
}
