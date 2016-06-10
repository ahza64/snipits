/**
 * @fileoverview  Export Collection to keep track of export snapshots
 */
var mongoose = require('mongoose');
var connection = require('dsp_database/connections')('meteor');

var schema = new mongoose.Schema({  
  latest:  { type: Boolean, default: false },  
  status: { type: String, default: "queued" },  
  script: { type: String }, //type of ingestion  
  name: { type: String }, //
  details: [],
  date: { type: Date, default: Date.now, index: true }
});

module.exports = connection.model('Ingest', schema);