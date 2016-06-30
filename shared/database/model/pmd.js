var mongoose = require('mongoose');
var connection = require('dsp_database/connections')('meteor');

var projectSchema = new mongoose.Schema({
  //_id
  name:{type: String},
  type:{type: String, index: true },

  project: {type: String, index: true }, //transmission_2015, cema_2016, etc  
  region: {type: String, index: true },  
  division: {type: String, index: true },    
  pge_pmd_num: {type: String, index: { unique: true }},
  vmd_circuit_num:  {type: String, index: { unique: true }},
  plan_pi_complete: { type: Date, default: Date.now, index: true},
  plan_tc_complete: { type: Date, default: Date.now, index: true},
  status: {type: String, index: true},
  nerc: {type: Boolean, index: true },
  
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
  
  cufs:[],
});

module.exports = connection.model('PROJECT', projectSchema);
