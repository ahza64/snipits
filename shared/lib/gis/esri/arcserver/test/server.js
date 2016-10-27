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
      services.should.containEql("EASTER_EGG_1511");
    });
  });

  it('be able to get service', function() {
    var server = new Server();
    return server.getService("EASTER_EGG_1511").then(function(service){
      service.name.should.eql("EASTER_EGG_1511");
      service.layer_by_id.points_easter_egg_1511.id.should.be.eql(0);
      service.layer_by_id.conductors_easter_egg_1511.id.should.be.eql(1);
    });
  });


  it('be able to iterate features in layer', function() {
    this.timeout(10000);
    var server = new Server();
    return server.getService("EASTER_EGG_1511").then(function(service){
      return service.getLayer('points_easter_egg_1511');
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
        total.should.be.eql(20);
        ids.should.containDeep([2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,21,22,23]);
      });
    });
  });

  it('be able to iterate features with total % batch = 0', function() {
    this.timeout(10000);
    var server = new Server();
    return server.getService("EASTER_EGG_1511").then(function(service){
      return service.getLayer('points_easter_egg_1511');
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
        total.should.be.eql(20);
        ids.should.containDeep([2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,21,22,23]);
      });
    });
  });


  it('should suport tokens', function(){
    var server = new Server();

    var token = new Token("https://esri.dispatchr.co:6443", "system", "465tenth", {expiration: 1});
    server.setToken(token);
    return server.folders().then(function(folders){
      folders.should.containEql("TRANSMISSION_2015");
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
      folders.should.containEql("TRANSMISSION_2015");
      var folder = yield server.getFolder('TRANSMISSION_2015');
      folder.getURL().should.be.eql("https://esri.dispatchr.co:6443/arcgis/rest/services/TRANSMISSION_2015");
      var services = yield folder.services();
      services.should.containEql("20160707_VACA_TESLA_UPDATE");
      var service = yield folder.getService("20160707_VACA_TESLA_UPDATE");              
      
      var layers = yield service.layers();
      layers.length.should.be.eql(4);
      for(var i = 0; i < layers.length; i++) {
        // console.log("LAYERS", layers[i]);
        var layer = yield service.getLayer(layers[i]);
        // console.log("layer", layer.layer.type);
        if(layer.layer.id === 0) {
          layer.type.should.be.eql("Group Layer");
          var url = "https://esri.dispatchr.co:6443/arcgis/rest/services/TRANSMISSION_2015"+
                    "/20160707_VACA_TESLA_UPDATE/MapServer/0";
          layer.getURL().should.be.eql(url);
          var sub_service = yield layer.getSubLayerService();
          var sub_layers = yield sub_service.layers();
          // console.log("SUB LAYERS", sub_layers);
          sub_layers.length.should.be.eql(3);
          sub_layers.should.containDeep([ 'VACA_TESLA_500kV_TreeTops', 
                                          'VACA_TESLA_500kV_Towers',
                                          'VACA_TESLA_500kV_Spans' ]);
        } else {
          layer.type.should.be.eql("Feature Layer");
        }
      }
    });
  });
  

});