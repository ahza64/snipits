var mongoose = require('mongoose');
var connection = require('./connections')('meteor');

console.error("DEPRECATED, treeSchema colleciton is no longer in use");

var treeSchema = new mongoose.Schema({
  _id:String,
  project:String,
  estr:String,
  status: String,
  day: Date,
  circuit_name : String,
  coord: [],
  location: {type: {}, index: '2dsphere'},
  streetNumber: String,
  streetName: String,
  city: String,
  state: String,
  zipcode: String,
  workorder: String,
  priority: Boolean,
  pge_pmd_num:String,
  division:String,
  type:String,
  groupid:String
});

module.exports = connection.model('TREESCHEMA', treeSchema);
