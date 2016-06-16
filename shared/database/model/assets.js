const mongoose = require('mongoose');
const connection = require('dsp_database/connections')('meteor');

const assetSchema = new mongoose.Schema({
  contentType: { type: String, default: null},
  description: { type: String, default: null},
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now, index: true },
  ressourceId: { type: String, default: null},
  ressourceType: { type: String, default: null},
  meta: {},
  data: { type: String, default: null}
});

module.exports = connection.model('assets', assetSchema);
