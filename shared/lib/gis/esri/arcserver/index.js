var co_iterator = require("dsp_lib/co_iterator");
var rp = require('request-promise');
var _ = require('underscore');

function api_generate_url(base_url, options) {

  var url = [base_url];
  options = options || {};
  if(options.folder) {
    url.push(options.folder);
  }
  if(options.service_name) {
    url.push(options.service_name);
  }
  if(options.service_type) {
    url.push(options.service_type);
  }
  if(options.layer_id !== null && options.layer_id !== undefined) {
    url.push(options.layer_id);
  }  
  if(options.query) {
    url.push("query");
  }  
  
  
  url = url.join('/');
  return url;
}

function api_request(base_url, options, params) {
  // console.log("api_request", base_url, options, params);

  options = options || {};
  params = params || {};
  params.f =  "pjson";
  if(options.token) {
    params.token = options.token;
  }  
  
  var url = api_generate_url(base_url, options);
  // console.log('ArcServerAPI Request', url, params);
  return rp({
    uri: url,
    qs:  params,
    json: true // Automatically parses the JSON string in the response
  }).then(function(response){
    
    if(response.error) {
      console.error("Server Request Error", response);
      return Promise.reject(response.error);
    }
    return response;
  });
}


var Server = function(base_url, token, folder) {
    this.base_url = base_url || "https://esri.dispatchr.co:6443/arcgis/rest/services";
    this.token = token;
    this.folder = folder;
};

Server.prototype.folders = function() {
  var api_opts = {
    folder: this.folder
  };      
  return this.api_request(api_opts).then(function(response){
    return response.folders;
  });
};

Server.prototype.services = function() {
  var self = this;
  var api_opts = {
    folder: this.folder
  };        
  return this.api_request(api_opts).then(function(response){
    if(self.folder) {
      //strip folder from service names
      _.each(response.services, service => {
        service.name = service.name.substring(self.folder.length+1);
      });
    }
    
    self._services = _.indexBy(response.services, 'name');
    return _.map(response.services, service => service.name);
  });  
};

Server.prototype.setToken = function(token) {
  this.token = token;  
};

Server.prototype.getService = function(service_name) {
  var get_services;
  var self = this;
  if(!this._services) {
    get_services = this.services();
  } else {
    get_services = Promise.resolve(this._services);
  }
  
  return get_services.then(function(){
    if(!self._services[service_name]) {
      return Promise.reject("Can not find service with name: ", service_name);
    } else {
      var api_opts = {
        service_name: service_name, 
        service_type: self._services[service_name].type,
        folder: self.folder
      };
      return self.api_request(api_opts).then(function(service){
        return new Service(self, self.folder, service_name, self._services[service_name].type, service);
      });       
    }
  });
};

Server.prototype.api_request = function(options, params) {
  var self = this;
  params = params || {};
  return Promise.resolve(this.token).then(function(token) {
    if(token) {
      return token.getTokenData();
    }
    return null;
  }).then(function(token_data){    
    if(token_data) {
      params.token = token_data.token;
    }
    if(self.folder) {
      options.folder = self.folder;
    }
    return api_request(self.base_url, options, params);
  });
};

Server.prototype.getFolder = function(folder_name) {
  return Promise.resolve(new Server(this.base_url, this.token, folder_name));
};

Server.prototype.getURL = function(options) {
  options = options || {};
  if(this.folder) {
    options.folder = this.folder;
  }  
  return api_generate_url(this.base_url, options);
};

var Service = function(server, folder_name, service_name, service_type, service, layer_ids) {
  this.server = server;
  this.folder_name = folder_name;
  this.name = service_name;
  this.type = service_type;
  this.service = JSON.parse(JSON.stringify(service));
  
  if(layer_ids) {
    this.service.layers = _.filter(this.service.layers, layer => _.contains(layer_ids, layer.id));
  }
  
  this.layer_by_id = {};
  _.each(this.service.layers, layer => { 
    this.layer_by_id[layer.name] = layer;
  });
};


Service.prototype.layers = function() {
  return Promise.resolve(_.map(this.service.layers, "name"));
};

Service.prototype.getLayer = function(layer_name) {
  var self = this;
  return this.api_request(this.layer_by_id[layer_name].id).then(function(layer){
    return new Layer(self, layer_name, layer);
  });
};

Service.prototype.layerHasSubLayers = function(layer_name) {
  return this.layer_by_id[layer_name].subLayerIds && this.layer_by_id[layer_name].subLayerIds.length > 0;
};

Service.prototype.api_request = function(layer_id, params) {
  var api_options = {
    folder: this.folder_name, 
    service_name: this.name, 
    service_type: this.type, 
    layer_id: layer_id, 
  };
  
  if(params) {
    api_options.query = true;
  }
  
  return this.server.api_request(api_options, params);
};

Service.prototype.getURL = function(layer_id) {
  var api_options = {
    folder: this.folder_name, 
    service_name: this.name, 
    service_type: this.type, 
    layer_id: layer_id, 
  };
  
  
  return this.server.getURL(api_options);
};

Service.prototype.getLayerFilterService = function(layer_ids) {
  return Promise.resolve(new Service(this.server, this.folder_name, this.name, this.type, this.service, layer_ids));
};

var Layer = function(service, layer_name, layer) {
  this.service = service;
  this.name = layer_name;
  this.layer = layer;
  this.type = layer.type;
};

/**
 * @description queries the Map Service for feature ids for all the features in the layer
 */
Layer.prototype.getFeatureIds = function() {
  var params = {
    where:"1=1",
    outFields: '*',
    outSR: "4326",
    returnIdsOnly: true
  };
  return this.query(params).then(function(response){
    return response.objectIds || [];
  });
};


Layer.prototype.getSubLayerService = function() {  
  return this.service.getLayerFilterService(_.map(this.layer.subLayers, layer => layer.id));
};



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
Layer.prototype.streamFeatures = function(batch_size) {
  var self = this;
  return co_iterator(function*(produce){
    var feature_ids = yield self.getFeatureIds();
    var feature_count = feature_ids.length;

    var params = {
      where:"1=1", 
      f: "pjson", 
      outFields: '*',
      outSR: "4326"
    };

    batch_size = batch_size || 500;    
    for(var i = 0; i < feature_count; i+=batch_size){ 
      var ids = feature_ids.slice(i, i+batch_size);
      params.objectIds = ids.join(",");    
      var response = yield self.query(params);
      if(response.features.length !== batch_size && i+response.features.length !== feature_count) {
        console.error("Feature Count Missmatch", {expected: feature_count, found: i+response.features.length, 
                                                  batch_size: batch_size, this_batch: response.features.length});
        throw new Error("Feature Count Missmatch");
      }
      for(var j = 0; j < response.features.length; j++) {
        yield produce(response.features[j]);
      }    
    }
  });
};

Layer.prototype.query = function(params) {
  params.query = true;
  return this.service.api_request(this.layer.id, params);
};


Layer.prototype.getURL = function() {
  return this.service.getURL(this.layer.id);
};


module.exports = Server;
