/**
 * The meta schema model for mongodb and postgresql
 */

const config = require('dsp_config/config').get().schema;

const mongoSchema = require('./mongo');
const PostgresSchema = require('./postgres');

let schema = null;
if (config.storage === 'postgres') {
  schema = new PostgresSchema(config);
} else {
  schema = mongoSchema;
}

module.exports = schema;
