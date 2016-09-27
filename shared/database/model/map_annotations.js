var mongoose = require('mongoose');
var connection = require('dsp_database/connections')('meteor');

var mapAnnotationsSchema = new mongoose.Schema({
  tree_id: {type: mongoose.Schema.Types.ObjectId},
  hash: {type: String},
  deleted: {type: Boolean},
  esri_graphics: []
});

module.exports = connection.model('map_annotations', mapAnnotationsSchema);
