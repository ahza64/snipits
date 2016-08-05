#!/usr/bin/env node

var utils = require('dsp_shared/lib/cmd_utils');
utils.connect(['meteor']);

var baker = require('dsp_shared/lib/baker');

const WorkorderModel = require('dsp_shared/database/model/workorders');

function run() {
  try {
    WorkorderModel.updateTreesWithoutWorkorders()
    .then(() => WorkorderModel.checkTreeCount())
    .then(() => utils.closeConnections())
    .catch(err => {
      console.log(err);
      utils.closeConnections();
    });
  } catch(err) {
    console.error('Error Initializing Application', err.stack ? err.stack : err);
    process.exit(1);
  }

}

function check() {
  WorkorderModel.checkTreeCount()
  .then((matches) => {
    if(!matches) {
      process.exit(1);
    }
  })
  .then(() => utils.closeConnections())
  .catch(err => {
    console.log(err);
    utils.closeConnections();
  });
  
}

//baker module
if (require.main === module) {
  baker.command(run, { default: true }); 
  baker.command(check);
  baker.run();
}
