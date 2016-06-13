/**
 * @fileoverview gps object
 */
var js2xmlparser = require("js2xmlparser");
var _ = require("underscore");


var GPS = {             // <TreeRecs_GPS> or <TreeLoc_GPS>
  nLatitude: null,      //    <nLatitude> numeric(12, 9)    format:   39.736025000
  nLongitude: null,     //    <nLongitude> numeric(12, 9)    format: -121.859128000
  dtMobileCapture: null //    <dtMobileCapture> datetime    Date/Time of flyover
};                      // </TreeRecs_GPS> or </TreeLoc_GPS>


var GPSRecord = function(type, lat, long, date) {
  this.root_node = {
    Loc: "TreeLoc_GPS",
    TreeLoc: "TreeLoc_GPS",
    Rec: "TreeRecs_GPS",
    TreeRec: "TreeRecs_GPS"
  }[type];
  
  if(!this.root_node) {
    this.root_node = type;
  }
  
  this.gps = _.extend({}, GPS);
  this.gps.nLongitude = long;
  this.gps.nLatitude = lat;
  this.gps.dtMobileCapture = date;
};

GPSRecord.prototype.getData = function(){
  return this.gps;
};

GPSRecord.prototype.toXML = function(){
  return js2xmlparser(this.root_node, this.gps);
};

module.exports = GPSRecord;