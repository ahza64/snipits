/**
 * @fileoverview  Export Collection to keep track of export snapshots
 */
var mongoose = require('mongoose');
var connection = require('dsp_database/connections')('meteor');

var schema = new mongoose.Schema({
  type: { type: String, required: true },
  tree_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  export_tree_id: {type: String, required: true },
  workorder_id: {type: String, required: true },
  export_date: { type: Date, required: true },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now, index: true }  
});

module.exports = connection.model('Export', schema);