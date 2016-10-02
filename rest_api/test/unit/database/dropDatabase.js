module.exports = function() {
  console.log('droping database');
  const config = require('dsp_shared/config/config').get({log4js : false});
  config.meteor.mongo_db_name = 'dispatcher_unit_test';
  require('dsp_shared/database/database')(config.meteor).connection.db.dropDatabase(config.mongo_db_name);
};