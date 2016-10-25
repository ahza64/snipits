/**
 * ArcServerToken
 * 
 * ESRI Docs: http://resources.arcgis.com/en/help/arcgis-rest-api/index.html#//02r3000000ts000000
 * 
 * @param {String} base_url 
 * @param {String} username
 * @param {String} password 
 * @param {Object} options options for token request
 *  client  ["referer", "ip", "requestip"];
 *  referer required if client === referer
 *  ip      required if client === ip
 */ 

var sha1 = require('sha1');
var fs = require('fs');
var rp = require('request-promise');
var assert = require('assert');
var BPromise = require("bluebird");
BPromise.promisifyAll(fs);


var ArcServerToken = function(base_url, username, password, options) {
  base_url = base_url || "https://esri.dispatchr.co:6443/arcgis";
  options = options || {};
  
  this.base_url = base_url;
  this.url = this.base_url + "/tokens/generateToken";
  
  this.username = username;
  this.password = password;
  
  this.client = options.client || "requestip";
  this.referer = options.referer || "";
  this.ip = options.ip || "";
  this.expiration = options.expiration || 60*24;
  
  var client_vals = ["referer", "ip", "requestip"];
  assert(client_vals.indexOf(this.client) !== -1, "Client must be in: "+ client_vals);
};

ArcServerToken.prototype.getTokenData = function() {
  var self = this;
  return this.readToken().then(function(token_data){
    if(token_data.expires && token_data.expires <= new Date().getTime()) {
      return Promise.reject("TOKEN EXPIRED");
    }
    return token_data;
  }).catch(function(error){
    if(error === "TOKEN EXPIRED" || error === "NO CACHED FILE") {
      return self.requestToken();
    }
    console.error("ArcServerToken.getTokenData", error);
    return Promise.reject(error);
  }).then(function(token_data){
    self.token_data = token_data;
    return self.writeToken();
  }).then(function(){
    return self.token_data;
  });      
};


ArcServerToken.prototype.requestToken = function(){
  // https://esri.dispatchr.co:6443/arcgis/tokens/generateToken?
  var params = {
    username: this.username,
    password: this.password,
    client: this.client,
    expiration: this.expiration,
    f: "pjson"
  };

  if(this.referer) {
    params.referer = this.referer;    
  }
  if(this.ip) {
    params.ip = this.ip;
  }

  // console.log('url', this.url, params);
  return rp.post({
    uri: this.url,
    form: params,
    json: true // Automatically parses the JSON string in the response
  }).then(function(body){    
    if(body.error) {
      return Promise.reject(body.error);
    } else {
      return body;
    }    
  });
    
};

ArcServerToken.prototype.readToken = function(){
  if(fs.existsSync(this.tokenFileName())) {
    return fs.readFileAsync(this.tokenFileName()).then(function(file){
      return JSON.parse(file);
    });
  } else {
    return Promise.reject("NO CACHED FILE");
  }
};

ArcServerToken.prototype.writeToken = function(){
  if(this.token_data) {
    return fs.writeFileAsync(this.tokenFileName(), JSON.stringify(this.token_data), {'encoding': 'utf8'});
  }
  return Promise.resolve();
};

ArcServerToken.prototype.tokenFileName = function() {
  return "/tmp/"+sha1([this.url, this.username, this.client, this.referer, this.ip].join());    
};



module.exports = ArcServerToken;