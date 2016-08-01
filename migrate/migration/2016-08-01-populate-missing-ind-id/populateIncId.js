#!/usr/bin/env node

var utils = require('dsp_shared/lib/cmd_utils');
utils.connect(['meteor']);
const BPromise = require('bluebird');
const TreeModel = require('dsp_shared/database/model/tree');
const IdentityCounter = utils.getConnection('meteor').connection.model('IdentityCounter');
const stream = require('dsp_shared/database/stream');

function *run() {
  var treeQuery = { inc_id: null, project: 'transmission_2015' };

  var count = yield TreeModel.find(treeQuery).count();
  var i = 0;
  for(var treeP of stream(TreeModel, treeQuery)) {
    var tree = yield treeP;
    i++;
    console.log("TREE", i, "of", count, tree._id, tree.inc_id);
    var incId = yield new BPromise((resolve, reject) => {
      return TreeModel.nextCount(function(err, count) {
        if(err) {
          reject(err);
        } else {
          resolve(count);
        }
      });
    });

    console.log(tree._id);
    console.log(incId);

    tree.inc_id = incId;

    yield tree.save()
    .then(() => updateCounter(tree))
    .catch(err => console.error(err.stack));
  }

  utils.closeConnections();
}
function updateCounter(tree){
  return IdentityCounter.findOneAndUpdate(
    { model: 'trees', field: 'inc_id', count: { $lt: tree.inc_id } },
    { count: tree.inc_id }
  );
}

if (require.main === module) {
  var baker = require('dsp_shared/lib/baker');
  utils.bakerGen(run, {default:true});  
  baker.run();  
}
