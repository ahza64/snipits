var _ = require('underscore');
var mongoose = require('mongoose');
var component = require('./outage_layer.json');
// var Schema = mongoose.

var result; 

var res = _.map(component, function (value, key) {
  return {key, value};

});

console.log("RES==>", res);

//
// var schema = new mongoose.Schema({
// });
