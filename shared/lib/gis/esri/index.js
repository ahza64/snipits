
var Route = require("./esri/route");
var Routing = require("./esri/routing");

module.exports.Route = Route;
module.exports.Routing = Routing;
module.exports.EsriToken = require("./esri/token");
module.exports.FeatureService = require('./esri/feature_service');
module.exports.Geocoding = require("./esri/geocode");

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
