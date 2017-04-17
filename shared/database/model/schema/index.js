/**
 * The meta schema model for mongodb, postgresql and elasticsearch
 */

const config = require('dsp_config/config').get().schema;

const PostgresSchema = require('./postgres');
const EsSchema = require('./elasticsearch');

let schema = null;
if (config.storage === 'postgres') {
  schema = new PostgresSchema(config);
} else if (config.storage === 'elasticsearch') {
  schema = new EsSchema(config);
} else {
  schema = require('./mongo');
}

module.exports = schema;
