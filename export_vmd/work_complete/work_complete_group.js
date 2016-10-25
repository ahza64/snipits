/**
 * @description This Object groups Work Complete objects export together
 */
const _ = require("underscore");
const assert = require('assert');
const js2xmlparser = require("js2xmlparser");

var TreeWorkCompleteGroup = function() {
  this.length = 0;
  this.contractor = null;
  this.division = null;
  this.pmd_num = null;
  
  
  this.work_completes = [];
};

TreeWorkCompleteGroup.prototype.addWorkComplete = function(work_complete) {

  if(this.work_completes.length === 0) {
    this.contractor = work_complete.get("ExternalWRParam-sContCode");
    this.division   = work_complete.get("ExternalWRParam-sDivCode");
    this.pmd_num    = work_complete.get("pge_pmd_num");
  } else {
    assert(this.contractor === work_complete.get("ExternalWRParam-sContCode"), "sContCode missmatch "+work_complete.get("ExternalTreeID"));
    assert(this.division   === work_complete.get("ExternalWRParam-sDivCode"), "sDivCode missmatch "+work_complete.get("ExternalTreeID"));
    assert(this.pmd_num    === work_complete.get("pge_pmd_num"), "iProjNum missmatch "+work_complete.get("ExternalTreeID"));
  }
  
  assert(this.contractor);
  assert(this.division);
  assert(this.pmd_num);
  this.work_completes.push(work_complete);  
  this.length = this.work_completes.length;
};

TreeWorkCompleteGroup.prototype.toXML = function() {
  
  
  // var file = ['<?xml version="1.0" encoding="UTF-8"?>'];
  // file = file.concat(_.map(this.work_completes, wc => wc.toXML()));
  // return file.join('\n');
  
  return js2xmlparser("WCBatch", {TreeWorkComp: _.map(this.work_completes, wc => wc.work_complete)});
};

TreeWorkCompleteGroup.prototype.get = function(key) {
  return this[key];
};


module.exports = TreeWorkCompleteGroup;
