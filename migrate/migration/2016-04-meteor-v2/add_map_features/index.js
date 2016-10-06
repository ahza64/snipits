#!/bin/env node
var utils = require('dsp_tool/util');
var XLSX = require('xlsx');
var _ = require('underscore');
var BPromise = require('bluebird');
var basename = require('path').basename;
var dirname = require('path').dirname;
var readDir = BPromise.promisify(require('fs').readdir);
var log = require('dsp_shared/config/config').get().getLogger('['+__filename+']');
var MapFeature = require("dsp_model/meteor_v3/map_feature"); 
var pathlib = require('path');
require('dsp_lib/starts_with');

function *run(path){
  var filenames;
  path = path || pathlib.dirname(__filename)+'/customer_alerts';
  if(path.endsWith('.xlsx')) {
    filenames = [basename(path)];
    path = dirname(path);
  } else {
    filenames = yield readDir(path);
  }

  for(var i = 0; i < filenames.length; i++) {
    var file_name = filenames[i];
    var file_path = path+"/"+file_name;
    log.debug("File Path", file_path);
    var workbook = XLSX.readFile(file_path);
    
    var sheet_name_list = workbook.SheetNames;
    for(var s = 0; s < sheet_name_list.length; s++) {
      var y = sheet_name_list[s];
      var worksheet = workbook.Sheets[y];
      var json_objs = XLSX.utils.sheet_to_json(worksheet);
      log.debug("GOT OBJECTS", json_objs.length);
      if(json_objs.length > 0 ){
        var bulk = MapFeature.collection.initializeUnorderedBulkOp();
        var count;
        for(var j = 0; j < json_objs.length; j++) {
          var row = sanitaizeObject(json_objs[j]);
          var doc = createDocument(row);
          if(doc) {
            bulk.find({source_id: row.unique_key.toString(), source: "PG&E"}).upsert().updateOne(doc);
          }
          count = j + 1;
          if((count % 1000) === 0) {
           bulk.executeSync = BPromise.promisify(bulk.execute);
           var result = yield bulk.executeSync();
           log.debug("EXEC RESULT OK", result.ok === 1);
           bulk = MapFeature.collection.initializeUnorderedBulkOp();
          }
        } 
        if((count % 1000) !== 0) {
          bulk.executeSync = BPromise.promisify(bulk.execute);
          result = yield bulk.executeSync();
          log.debug("EXEC RESULT OK", result.ok === 1);
        }
      }
      json_objs = null;
    }
  }
}
/* 
{
      "unique_key": 769,
      "div_code": "CC",
      "circuit_name": "BEN LOMOND 0401",
      "source_dev": 9421,
      "address": "870 VALLEY VIEW RD",
      "city": "BEN LOMOND",
      "county": "Santa Cruz",
      "comments": "BTWN 4WY POLE 1 ON HILL & POLE 910 NEAR HM.",
      "directions": "SPAN OVER MAILBOX",
      "cust_name": "JEAN W MORAN",
      "cust_phone": "831-336-5470",
      "cust_name2": null,
      "cust_phone2": null,
      "alert_codes": "DG",
      "alert_descriptions": "Dog",
      "latitude": 37.075918,
      "longitude": -122.091879,
      "refresh_date": 345.3
}
*/
function createDocument(row) {
  var doc = {
    type: "alert",
    source: "PG&E",
    source_id: row.unique_key.toString(),
    data: row,
    map_icon: []
  };
  if(row.longitude && row.latitude) {
    doc.location = {type: "Point", coordinates: [row.longitude, row.latitude]};
  }
  
  var lat = Number(row.latitude);
  var long = Number(row.longitude);
  if(Number.isNaN(lat) || Number.isNaN(long) || lat > 90 || lat < -90 || long > 180 || long < -180){
    log.error("FOUND BAD LOCATION", row);
    return null;
  }
    
  return doc;
}


//To Dashed from Camel Case
String.prototype.toUnderscore = function(){
  var s;
  if(isUpperCase(this)) {
    s = this.toLowerCase();
  } else {
    s = this[0].toLowerCase() + this.substring(1);
  }
  return s.replace(/([A-Z])/g, function($1){return "_"+$1.toLowerCase();});
};
function isUpperCase(str) {
  return str === str.toUpperCase();
}

var key_mapping = {"iUniqueKey": "unique_key"};

function sanitaizeObject(obj) {
  var newObj = {};
  _.each(obj, function(value, key){
    key = key_mapping[key] || key;
    
    key = key.toUnderscore();
    value = value.trim();
    if(!value || value.toUpperCase() === "NULL") {
      value = null;
    }    
    var num = Number(value);
    if(value && !Number.isNaN(num)) {
      value = num;
    }

    newObj[key] = value;
  });
  return newObj;
}

if (require.main === module) {
  var baker = require('dsp_tool/baker');
  baker.command(function(path){
    return utils.generatorWithDb(run(path));
  }, {command: "run", default: true});  
  
  baker.run();  
}