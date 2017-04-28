/**
 * The meta schema model for mongodb, postgresql and elasticsearch
 */

const _ = require('underscore');
const config = require('dsp_config/config').get().schema || {};
const Schema = require('./schema');

module.exports = Schema(config);
