#!/bin/env node
/*
   @author gabe@dispatchr.com
   @fileoverview sets source to mobile for all tree histories that do not have a source attribute.
*/
var utils = require('dsp_shared/lib/cmd_utils');
utils.connect(['meteor', 'postgres']);
var TreeHistory = require("dsp_shared/database/model/tree-history");

function *run(fix){
  console.log("Setting tree history source");
  var query = {source: null};
  var count = yield TreeHistory.find(query).count();
  console.log("Fixing TreeHistories", count);
  if(fix) {
    var result = yield TreeHistory.update(query, {$set: {source: "mobile"}}, {multi: true});
    console.log("RESULT", result);
  } 
}


if (require.main === module) {
  var baker = require('dsp_shared/lib/baker');
  utils.bakerGen(run, {default:true});
  baker.run();
}

module.exports = run;

