/**
 * @fileOverview  contains the connection information to connect to database
 */

var mongoose = require('mongoose');
var config = require("../conf.d/config.json");
mongoose.connect('mongodb://' + config.db_host + '/' + config.db_name);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("succesfully connected");
  // we're connected!
});
