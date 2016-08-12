'use strict';
var utils = require('dsp_lib/cmd_utils');
utils.connect(['postgres']);

function *run() {
  const sequelize = require('dsp_database/connections')('postgres');
  
  // Load all models  
  var TreeHistories = require('./model/tree-history/trees-history-pg-schema');
  TreeHistories.establishRelationships();


  console.log('Start database sync');
  yield sequelize.sync();
  console.log('Database sync completed');
}

if (require.main === module) {
  utils.bakerGen(run, {default:true});  
  utils.bakerRun();  
}
