#!/usr/bin/env node
var _ = require('underscore');
var utils = require('dsp_shared/lib/cmd_utils');
utils.connect(['meteor']);
const BPromise = require('bluebird');
const TreeModel = require('dsp_shared/database/model/tree');
const IdentityCounter = utils.getConnection('meteor').connection.model('IdentityCounter');
const Stream = require('dsp_shared/database/stream')
const co = require('co');

function *run() {
  co(function*() {

    var treeQuery = { inc_id: null, project: 'transmission_2015' };

    for(var treeP of Stream(TreeModel, treeQuery)) {
      var tree = yield treeP;
      var incId = yield new Promise((resolve, reject) => {
        return TreeModel.nextCount(function(err, count) {
          if(err) {
            reject(err);
          } else {
            resolve(count)
          }
        });
      })

      console.log(tree._id);
      console.log(incId);

      tree.inc_id = incId;

      yield tree.save()
      .then(() => updateCounter(tree))
      .catch(err => console.error(err.stack))
    }

    utils.closeConnections();
  });
}
function updateCounter(tree){
  return IdentityCounter.findOneAndUpdate(
    { model: 'trees', field: 'inc_id', count: { $lt: tree['inc_id'] } },
    { count: tree.inc_id }
  );
}

if (require.main === module) {
  var baker = require('dsp_shared/lib/baker');
  utils.bakerGen(run, {default:true});  
  baker.run();  
}
