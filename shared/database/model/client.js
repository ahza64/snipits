const mongoose = require('mongoose');
const connection = require('dsp_database/connections')('meteor');

const clientSchema = new mongoose.Schema({
  min_version: {type: String},
  max_version: {type: String},
  upgrade_url: {type: String},
  name: {type: String},
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now, index: true },
});

module.exports = connection.model('clients', clientSchema);
