/**
    Models define a Schema will add a will define add that model to the mongoose db connection
*/
var log = require('log4js').getLogger('['+__filename +']');
var mongoose = require('mongoose');
var connection = require('dsp_database/connections')('trans');
var Schema = mongoose.Schema;
var _ = require('underscore');
var geo = require('dsp_lib/gis/geo');

var treeSchema = new  Schema({
  type: {type: String}, //zone, tree, ...
  
  zone: {type: String}, //zone fields
  min_mgcc: {type: Number}, //zone fields
  count: {type: Number, default: null},
  
  health: {type: Number, default: 100},
  status: {type: String },
  species: {type: String, default: "unknown", index: true},
  estimated_time: {type: Number},
  warnings: {type: []},
  comment: {type: String},
  tasks: {type: []},
  height_above_line: {type: Number, index: true, default: null},
  distance_from_line: {type: Number, index: true, default: null},
  height: {type: Number, index: true, default: null},
  dbh: {type: Number, index: true, default: null},
  address: {type: String},
  grid: {type: Schema.ObjectId, ref: 'Grid', required: false},
  group_id: {type: Number},
  map_annotations: {type: []},
  priority: {type: String},
  location: {type: {}, index: '2dsphere'},
  checksum: {type: String},
  grid_segment_id: {type: Number},
  gis_id: {type: String},
  tree_id: {type: String},
  qsi_tree_id: {type: String},
  qsi_span_number: {type: Number},
  qsi_priority: {type: String},
  pge_pmd_num: {type: String},
  exclusion_zone: {type: Boolean},
  refused: {type: Boolean, default: false},
  properties: {type: {}, default: {}},
  inspector_user: {type: Schema.ObjectId, ref: 'User', default: null},
  inspector_veh: {type: Schema.ObjectId, ref: 'Vehicle', default: null},
  inspector_wo: {type: Schema.ObjectId, ref: 'WorkOrder', default: null},
  inspector_idx: {type: Number},
  trimmer_user: {type: Schema.ObjectId, ref: 'User', default: null},
  trimmer_veh: {type: Schema.ObjectId, ref: 'Vehicle', default: null},
  trimmer_wo: {type: Schema.ObjectId, ref: 'WorkOrder', default: null},
  trimmer_start_time: { type: Date, default: null },
  trimmer_complete_time: { type: Date, default: null },
  trimmer_status: {type: String},
  work_order: {type: Schema.ObjectId, ref: 'WorkOrder', default: null},
  grouping: {type: Schema.ObjectId, ref: 'CalculateTreeGroup', default: null},
  ready_to_group: { type: Boolean},
  start_time: { type: Date, default: null },
  span_name: {type: String},
  complete_time: { type: Date, default: null },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now, index: true },
  exported: { type: Date, default: null, index: true },
  schemaVersion: {type: String}
}, {minimize: false});

treeSchema.virtual('id').get(function() {
    return this._doc.inc_id;
});

var Tree = connection.model('Tree', treeSchema);


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

  log.debug("findNear INPUT", location, distance, unit, query, limit);
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
