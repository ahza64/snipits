var EsriToken = require('./token');
var util = require('./util');
var http_get = util.http_get;


var Geocoding = {
  geocode: function*(address){
      console.log("GEOCODE", address);
      var url ="http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/geocodeAddresses";
      var token = yield EsriToken.get();
      var addresses = {
                        records:[
                          {
                            attributes: {
                              "OBJECTID":1,
                              "SingleLine": address
                            }
                          }
                        ]
                      };

      var params = {
                    token:token,
                    sourceCountry:"USA",
                    f:'pjson',
                    addresses: JSON.stringify(addresses)
      };         
      
      console.log("GEOCODE REQUEST", url, params);         
      var response  = yield http_get(url, params);
      console.log("GEOCODE RESULTS", response);
      return response;
  },
  reverse: function*(location){
      console.log("Reverse Geocode", location);
      
      if(location.coordinates) {
        location = location.coordinates;
      }
      
      var url ="http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode";
      var token = yield EsriToken.get();
      var loc = {};
      if(Array.isArray(location)){
        loc.x = location[0];
        loc.y = location[1];
      }
      


      var params = {
                    token:token,
                    sourceCountry:"USA",
                    location: JSON.stringify(loc),
                    f:'pjson'
      };         
      
      console.log("REV GEOCODE REQUEST", url, params);         
      var response  = yield http_get(url, params);
      console.log("REV GEOCODE RESULTS", response);
      return response;
  }
};

module.exports = Geocoding;