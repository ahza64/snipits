#!/usr/bin/env node
var _ = require('underscore');
var utils = require('dsp_shared/lib/cmd_utils');
utils.connect(['meteor']);
const BPromise = require('bluebird');
const TreeModel = require('dsp_shared/database/model/tree');

function *fixIncTreeIds() {
  var treeQuery = { inc_id: null, project: 'transmission_2015' };

  return TreeModel.find(treeQuery)
  .then(trees => {
    return BPromise.all(trees.map(tree => {
      console.log(tree._id);
      return new BPromise((resolve, reject) => { 
        TreeModel.nextCount((err, count) => {
          if(err) {
            return reject(err);
          } else {
            tree.inc_id = count;
            return resolve(tree.save());
          }
        });
      })
    }))
    .then((trees) => console.log())
    .then(() => utils.closeConnections())
    .catch(err => { console.error(err.stack); utils.closeConnections() });
  })
}

function *run(){
  try {
    yield fixIncTreeIds();
  } catch(err) {
    console.error('Error Initializing Application', err.stack ? err.stack : err);

    utils.closeConnections();
    process.exit(1);
  }
}

if (require.main === module) {
  var baker = require('dsp_shared/lib/baker');
  utils.bakerGen(run, {default:true});  
  baker.run();  
}
