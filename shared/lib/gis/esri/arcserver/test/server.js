/* globals describe, it, before, after */

// Module
require('dsp_config/config').get({log4js: false});
const Server = require("../index");
const Token = require("../token");
require("should");
const co = require("co");
// Test Block
describe('ESRI ArcServer', function() {

  before(function(done) {
    done();
  });

  after(function(done) {
    done();
  });

  it('be able to list services', function() {
    var server = new Server();
    return server.services().then(function(services){
      // console.log("services", services);
      services.should.containEql("EASTEREGG_1101");
    });
  });

  it('be able to get service', function() {
    var server = new Server();
    return server.getService("EASTEREGG_1101").then(function(service){
      service.name.should.eql("EASTEREGG_1101");
      service.layer_by_id.points_easteregg_1101.id.should.be.eql(0);
      service.layer_by_id.conductors_easteregg_1101.id.should.be.eql(1);
    });
  });


  it('be able to iterate features in layer', function() {
    this.timeout(10000);
    var server = new Server();
    return server.getService("EASTEREGG_1101").then(function(service){
      return service.getLayer('points_easteregg_1101');
    }).then(function(layer){
      // console.log("GOT LAYER", layer);
      return co(function*(){
        var total = 0;
        var ids = [];
        for(var feature of layer.streamFeatures(3)) {
          feature = yield feature;
          if(feature) {
            total++;
            ids.push(feature.attributes.OBJECTID);
          }
        }
        
        total.should.be.eql(22);
        ids.should.containDeep([1,4,41,46,53,72,89,99,110,144,148,155,173,191,222,224,249,251,261,280,296,298]);
      });
    });
  });

  it('be able to iterate features with total % batch = 0', function() {
    this.timeout(10000);
    var server = new Server();
    return server.getService("EASTEREGG_1101").then(function(service){
      return service.getLayer('points_easteregg_1101');
    }).then(function(layer){
      // console.log("GOT LAYER", layer);
      return co(function*(){
        var total = 0;
        var ids = [];
        for(var feature of layer.streamFeatures(1)) {
          feature = yield feature;
          if(feature) {
            total++;
            ids.push(feature.attributes.OBJECTID);
          }
        }
        total.should.be.eql(22);
        ids.should.containDeep([ 1,4,41,46,53,72,89,99,110,144,148,155,173,191,222,224,249,251,261,280,296,298]);
      });
    });
  });


  it('should suport tokens', function(){
    var server = new Server();

    var token = new Token("https://esri.dispatchr.co:6443", "system", "465tenth", {expiration: 1});
    server.setToken(token);
    return server.folders().then(function(folders){
      folders.should.containEql("TRANSMISSION_2015_MERGE");
    }).catch(error => {
      return Promise.reject(new Error(error.message));
    });
  });
  
  
  it('should suport folders folders', function(){
    var server = new Server();
    var token = new Token("https://esri.dispatchr.co:6443", "system", "465tenth", {expiration: 1});
    server.setToken(token);

    // console.log("GTO SERVICE", service);
    return co(function*(){
      
      var folders = yield server.folders();
      folders.should.containEql("TRANSMISSION_2015_MERGE");
      var folder = yield server.getFolder('TRANSMISSION_2015_MERGE');
      folder.getURL().should.be.eql("https://esri.dispatchr.co:6443/arcgis/rest/services/TRANSMISSION_2015_MERGE");
      var services = yield folder.services();
      services.should.containEql("ALL_LINES");
      var service = yield folder.getService("ALL_LINES");              
      
      var layers = yield service.layers();
      layers.length.should.be.eql(2);
      for(var i = 0; i < layers.length; i++) {
        // console.log("LAYERS", layers[i]);
        var layer = yield service.getLayer(layers[i]);
        // console.log("layer", layer.layer.type);
        if(layer.layer.id === 0) {
          layer.type.should.be.eql("Feature Layer");
          var url = "https://esri.dispatchr.co:6443/arcgis/rest/services/TRANSMISSION_2015_MERGE"+
                    "/ALL_LINES/MapServer/0";
          layer.getURL().should.be.eql(url);
          layers.should.containDeep([ 'ALL_Towers', 'ALL_Spans',]);
          
          var sub_service = yield layer.getSubLayerService();
          var sub_layers = yield sub_service.layers();
          // console.log("SUB LAYERS", sub_layers);
          sub_layers.length.should.be.eql(0);
        } else {
          layer.type.should.be.eql("Feature Layer");
        }
      }
    });
  });
  

});