var mongoose = require('mongoose');
var connection = require('dsp_database/connections')('meteor');

var cufSchema = new mongoose.Schema({
  _id:{type: String},
  vehicle:{type:String, index: true},
  name:{type:String, index: true},
  first:{type:String, index: true},
  last:{type:String, index: true},
  user:{type:String, index: true},
  uniq_id:{type:String, index: true},
  project:[],
  work_type: [],
  scuf:{type:String, index: true},
  phone_number:{type:String, index: true},
  status:{type:String, index: true},
  company: {type: String},
  workorder: []
});

module.exports = connection.model('CUFS', cufSchema);
