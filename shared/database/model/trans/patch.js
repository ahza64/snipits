/**
    Models define a Schema will add a will define add that model to the mongoose db connection

    devices are physical devices that have connected to our system.
*/
var mongoose = require('mongoose');
var connection = require('dsp_database/connections')('trans');
var stream = require('dsp_database/stream');
var co_iterator = require('dsp_lib/co_iterator');
var _ = require("underscore");
var jsonpatch = require('fast-json-patch');
var assert = require('assert');

var schema = new mongoose.Schema({
    resource: {type: String, index: true},
    resource_id: {type: String, index: true},
    patches: [],
    inital: { type: Boolean, default: false, index: true },
    created: { type: Date, default: Date.now, index: true },
});


schema.statics.versionIterator = function(resource_type, resource_id) {
  var resource = {};
  return co_iterator(function *(handleNext){
    for(var patch of stream(Patch, {resource: resource_type, resource_id: resource_id}, {created: 1})){
      patch = yield patch;
      // console.log("PATCH", patch);
      if(patch) {
        var date = Date.create(patch.created);
        resource = apply_patch(resource, patch);              
        yield handleNext(JSON.parse(JSON.stringify(resource)));
      } else {
        yield handleNext(null);
      }
    }  
  });
};

function apply_patch(res, patch_res) {
  while(true) {
    try {
      if(patch_res.inital) {
        return _.extend({}, patch_res.patches[0].value);
      } else {
        var ret = _.extend({}, res); //copy
        jsonpatch.apply(ret, patch_res.patches);
        return ret;
      }      
    } catch(e) {      
      var repaired = repair_patch(e, res, patch_res.patches, patch_res.resource_id, patch_res._id);
      if(!repaired) {
        console.error("PATCHING ERROR", e.message, ret, patch_res.patches);
        throw e;
      }
    }
  }
}


function repair_patch(e, resource, patches) {
  
  var match = e.message.match(/Cannot set property '(.*)' of undefined/);
  if(match) {
    for(var i = 0; i < patches.length; i++) {
      var key = match[1];
      var path = patches[i].path;
      if(path.endsWith("/"+key) && evalPath(resource, path) === undefined ) {
        var index = path.indexOf("/"+key);
        path = patches[i].path.slice(0, index);
        
        if(isNumeric(key)) {
          var value = [];
          value.push(patches[i].value);
        } else {
          value = {};
          value[match[1]] = patches[i].value;          
        }
        patches[i].path = path;        
        patches[i].value = value;
        return true;
      }
    }
  }
  return false;  
}

function evalPath(resource, path) {
  var keys = path.split('/');
  for(var i = 0; i < keys.length; i++) {
    if(resource === undefined) {
      break;
    }
    resource = resource[keys[i]];
  }
  return resource;
}

//https://github.com/jquery/jquery/blob/master/src/core.js
function isNumeric( obj ) {

		return ( _.isNumber(obj) || _.isString(obj) ) &&

		// parseFloat NaNs numeric-cast false positives ("")
		// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
		// subtraction forces infinities to NaN
		!isNaN( obj - parseFloat( obj ) );
}


var Patch = connection.model('Patch', schema);

module.exports = Patch;


