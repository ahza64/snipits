var geo = require('dsp_lib/gis/geo');
var _ = require("underscore");
var mongoose = require('mongoose');
var connection = require('dsp_database/connections')('meteor');
const autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(connection);

var TreeStates = require('tree-status-codes');
var treeSchema = new mongoose.Schema({
  project: String,
  status: String,
  circuit_name: String,
  location: { type: {}, index: '2dsphere' },
  streetNumber: String,
  streetName: String,
  city: String,
  state: String,
  county: String,
  zipcode: String,
  pge_pmd_num: String,
  pge_detection_type: String,
  division: String,
  type: {type: String, default: "tree"},//tree/zone (tree, zone, shrub)
  pi_complete_time: Date,
  tc_complete_time: Date,
  map_annotations: { type: [] },
  species: {type: String, default: "unknown"},
  span_name: String,

  riparian: Boolean,
  //added things below
  inc_id: {type: Number, index: { unique: true}},
  region: {type: String, index: true},
  qsi_id: {type: String, index: true},
  assigned_user_id: String,
  pi_start_time: { type: Date, index: true },
  pi_user_id: { type: String, index: true },
  tc_start_time: { type: Date, index: true },
  tc_user_id: { type: String, index: true },
  tc_overtime: { type: String, default: 'standard', enum: ['standard', 'overtime', 'double', 'time/material', 'non-billable'] },
  
  address: {type: String}, //from mobile app
  trim_code: {type: String},
  image: {type: mongoose.Schema.Types.ObjectId},
  tc_image: {type: mongoose.Schema.Types.ObjectId},
  ntw_image: {type: mongoose.Schema.Types.ObjectId},
  clearance: {type: Number},
  notify_customer_value: {type: String},
  comments: {type: String},
  access_code_value: {type: String},
  health: {type: Number, default: 100},
  height: {type: Number, default: null},
  dbh: {type: Number, default: null},

  //zone properties
  count: {type: Number, default: 1}, //trees in zone
  zone: {type: Number}, //which zone of the span  1,2,3,4,5)
  min_mgcc: {type: Number},
  exported: { type: Date, index: true }, //inspected
  exported_worked: { type: Date, index: true },
  gps_acq_date: { type: Date, index: true },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now, index: true },
  
});

treeSchema.index({location: '2dsphere'});
treeSchema.plugin(autoIncrement.plugin, { model: 'trees', field: 'inc_id' });

var Tree = connection.model('Tree', treeSchema);


Tree.queryStatus = function(statuses, not) {
  if(!Array.isArray(statuses)) {
    statuses = [statuses];
  }
  not = not || false;
  if(not) {
    not = "^";
  } else {
    not = "";
  }

  var statustoString = new TreeStates.StatusFlagsToString();
  for(var i = 0; i < statuses.length; i++) {
      statuses[i] = statustoString.getStatus(statuses[i]).statusCode[0];
  }

  var status_char = statuses.join('');
  var regEx = "^["+not+status_char+"]";
  // regEx = new RegExp(regEx);
  return {status: {$regex: regEx}};
};

Tree.findNear = function*(location, distance, unit, query, limit) {
  unit = unit || 'radian';
  limit = limit || 500;
  if(Array.isArray(location)) {
    location = {
      type: "Point",
      coordinates: location
    };
  } else if(location.location) {
    location = location.location;
  }

  // log.debug("findNear INPUT", location, distance, unit, query, limit);
  distance = geo.toRadians(distance, unit);
  distance = geo.fromRadians(distance, 'meter');
  var results = yield Tree.geoNear(location, { maxDistance : distance, spherical : true, limit: limit, query: query });
  // log.debug("WHF FIND NEAR>>>>>>>>>>", results);
  _.each(results, function(result){
    result.dis = geo.toRadians(result.dis, 'meter');
    result.dis = geo.fromRadians(result.dis, unit);
  });
  return results;
};

module.exports = Tree;
