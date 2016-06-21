require('sugar');
require('dsp_shared/config/config').get('meteor');
const utils = require('dsp_shared/lib/cmd_utils');
const _ = require('underscore');
const mongoose = require('mongoose');

utils.connect(['meteor']);

var BPromise = require('bluebird');
const fs = BPromise.promisifyAll(require('fs'));
const xml2js = BPromise.promisifyAll(require('xml2js'));
const assert = require('assert');
const TreeModel = require('dsp_shared/database/model/tree');

function *run(folder, date, unset) {  
  date = Date.create(date);
  if(!date.isValid()) {
    date = new Date();
  }
  console.log("DATE", date);
  
  var ids = yield get_ids(folder);
  var id_objs = _.map(_.filter(ids, function(id) { return id.length === 24;}), function(id){ return mongoose.Types.ObjectId(id); });
  var trees = yield TreeModel.find({$or: [
    {qsi_id: {$in: ids}},
    {_id: {$in: id_objs}}
  ]});
  console.log("ids", ids.length);  
  console.log("TREES", trees.length);
  assert(trees.length === ids.length, "NOT ENOUGH TREES");


  var exported = date;
  if(unset) {
    exported = null;
  }
  
  var update = yield TreeModel.update({$or: [
      {qsi_id: {$in: ids}},
      {_id: {$in: id_objs}}
  ]}, {$set: {exported: exported}}, {multi: true});
  
  return update;
}


function *get_ids(folder) {
  var files = yield fs.readdirAsync(folder);
  var ids = [];
  
  
  for(var i = 0; i < files.length; i++) {
    var file = files[i];
    if(file.endsWith('xml')) {
      
      file = yield fs.readFileAsync([folder, file].join('/'));
      var work_packet = yield xml2js.parseStringAsync(file);
      work_packet.TreeWorkPacket.TreeLoc.forEach(loc => {
        loc.TreeRecs.forEach(tree => {
          ids = ids.concat(tree.ExternalTreeID);
        });
      });
    }
  }
  return ids;
  
}



//baker module
if (require.main === module) {
  utils.bakerGen(run, { default: true }); 
  utils.bakerRun();  
}
