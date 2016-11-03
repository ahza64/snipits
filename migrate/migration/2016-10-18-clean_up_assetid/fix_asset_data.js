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
var fs =  require("fs");

function *run(push){
  console.log('running...');
  push = push || false;
  var one = yield Tree.find({ tc_image: {$ne:null} },{_id:1, tc_image: 1}).exec();
  var m=0;
  for(var u=0; u < one.length; u++){
    var image_details = yield Assets.find({ _id: mongoose.Types.ObjectId(one[u].tc_image) }, { _id:1 });
    if(image_details.length == 0){
      m++;
      console.log(one[u],m)
      if(push){
      
      console.log("removing");
      yield Tree.update( { _id: one[u]._id } , { $unset: { tc_image: 1} }); 
      }
    }
  }
  var two = yield Tree.find({ image: {$ne:null} },{_id:1, image: 1}).exec();
  for(var u=0; u < two.length; u++){
    var image_details = yield Assets.find({ _id: mongoose.Types.ObjectId(two[u].image) }, { _id:1 });
    if(image_details.length == 0){
      m++;
      console.log(two[u],m)
      if(push){
      console.log("removing");
      yield Tree.update( { _id: two[u]._id } , { $unset: { image: 1} }); 
      }
    }
  }
  var three = yield Tree.find({ ntw_image: {$ne:null} },{_id:1, ntw_image: 1}).exec();
  for(var u=0; u < three.length; u++){
    var image_details = yield Assets.find({ _id: mongoose.Types.ObjectId(three[u].ntw_image) }, { _id:1 });
    if(image_details.length == 0){
      m++;
      console.log(three[u],m)
      if(push){
      console.log("removing");
      yield Tree.update( { _id: three[u]._id } , { $unset: { ntw_image: 1} }); 
      }
    }
  }
  
}

module.exports = run;
