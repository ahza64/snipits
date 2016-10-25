var mongoose = require('mongoose');
var connection = require('dsp_database/connections')('meteor');

var usersSchema = new mongoose.Schema({
  _id: {type: String},
  services: Object,  
  emails:{type: []},
  profile:{type: {}}
});

module.exports =  connection.model('USERS', usersSchema);
