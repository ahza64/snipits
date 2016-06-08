/**
 * @fileoverview  Export Collection to keep track of export snapshots
 */
var mongoose = require('mongoose');
var connection = require('dsp_database/connections')('meteor');

var schema = new mongoose.Schema({
  type: { type: String },  
  data: {type: {}},
  export_date: { type: Date, default: Date.now, index: true }
});

module.exports = connection.model('Export', schema);