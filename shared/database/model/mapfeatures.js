var mongoose = require('mongoose');
var geo = require('../../lib/gis/geo.js');
var _ = require('underscore');

var connection = require('../connections')('meteor');
var schema = new mongoose.Schema({
    type: { type: String, requried: true},
    location: {type: {}, index: '2dsphere'},
    data: { type: {}, default: {}},
    source: {type: String, required: true},
    source_id: {type: String, required: true},
    source_data: { type: {}, default: {}, select: false },
    map_icon: [],
    created: { type: Date, default: Date.now, index: true },
    updated: { type: Date, default: Date.now, index: true }
});

schema.index({source: 1, source_id: 1}, {unique: true});
var MapFeature = connection.model('MapFeature', schema);

MapFeature.findNear = function*(location, distance, unit, query, limit) {
  unit = unit || 'radian';
  limit = limit || 500;
  distance = geo.toRadians(distance, unit);
  distance = geo.fromRadians(distance, 'meter');
  var results = yield MapFeature.geoNear(location, { maxDistance : distance, spherical : true, limit: 500, query: query });
  _.each(results, function(result){
    result.dis = geo.toRadians(result.dis, 'meter');
    result.dis = geo.fromRadians(result.dis, unit);
  });
  return results;
};

module.exports = MapFeature;
