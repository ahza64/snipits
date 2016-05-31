var mongoose = require('mongoose');
var connection = require('dsp_model/connections')('meteor');

var geoschema = new mongoose.Schema({
  name:String,
  url:String,
  project:String,
  total_count:Number,
  detected_count:Number,
  inspected_count:Number,
  listed_count:Number,
  worked_count:Number,
  allgood_count:Number,
  child:[]
});


module.exports = connection.model('GEOTREE', geoschema);