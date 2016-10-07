var mongoose = require('mongoose');
var connection = require('dsp_database/connections')('meteor');

var usersSchema = new mongoose.Schema({
  services: Object,
  emails:{type: []},
  profile:{type: {}}
});

module.exports =  connection.model('USERS', usersSchema);
