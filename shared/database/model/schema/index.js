/**
 * The meta schema model for mongodb, postgresql and elasticsearch
 */

const config = require('dsp_config/config');
const Schema = require('./schema');

module.exports = Schema(config.get().schema || {});
