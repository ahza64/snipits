#!/usr/bin/env node

var utils = require('dsp_shared/lib/cmd_utils');
utils.connect(['meteor']);

const WorkorderModel = require('dsp_shared/database/model/workorders');

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
