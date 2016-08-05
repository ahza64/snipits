var mongoose = require('mongoose');
var connection = require('dsp_database/connections')('meteor');

var citySchema = new mongoose.Schema({
  city: String,
  project:String,
  estr:String,
  total_count:Number,
  detected_count:Number,
  inspected_count:Number,
  listed_count:Number,
  worked_count:Number,
  allgood_count:Number,
  city_id:String,
  child:[]
});


module.exports = connection.model('CITY', citySchema);