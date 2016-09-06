#!/bin/env node
/*
   @author tw3rp
   @fileoverview corrects circuit names in projects
   */
var utils = require('dsp_shared/lib/cmd_utils');
var _ = require('underscore');
utils.connect(['meteor']);
var mongoose = require('mongoose');

var Assets = require("dsp_shared/database/model/assets");
var Tree = require("dsp_shared/database/model/tree");
var mapping = require("./mapping.js");
var fs =  require("fs");

function *run(push){
  console.log('running...');

  push = push || false;
  var one = yield Tree.find({status: /^5/, tc_image:null },{_id:1}).exec();
  console.log("total trees without image found: ", one.count())
  var total_found = 0;
  console.log("total mapping available : ", mapping.length);
  var unique_assets = _.uniq(mapping, tree => tree.assetid)
  console.log("total unique available : ", unique_assets.length);
  var result = mapping.filter(function(obj){ return !_.findWhere(unique_assets, obj); });
  console.log(result)
  for(var i=0; i<mapping.length; i++){
    var curr_record = mapping[i];
    //console.log(curr_record);
    if(push){
      console.log("updating tree : ", curr_record.treeid, " ,assetid: ", curr_record.assetid);
      yield Tree.update({ _id: mongoose.Types.ObjectId(curr_record.treeid) }, { $set: { tc_image : mongoose.Types.ObjectId(curr_record.assetid) } });
    }
  }
}

module.exports = run;
