var _ = require('underscore');
var mongoose = require('mongoose');
var file = require('./outage_layer.json');
var connection = mongoose.connect('mongodb://localhost:27017/migrate');

var fileName = process.argv[2];
var result = {};
var schema = mongoose.Schema.Types;
var mTypes = {
  "string" : mongoose.Schema.Types.String,
  "number" : schema.Number,
  "date"   : schema.Date,
  "boolean": schema.Boolean,
  "object" : schema.Object,
  "array"  : schema.Array
};

var newDoc = new mongoose.Model(result);
_.each(file, function (value, key, {}) {
  console.log("val", value, "key", key);
  var type = typeof value;
  result[key] = mTypes[type];
});

var newSchema = new mongoose.Schema(result);
var model = connection.model(fileName, newSchema);

console.log(result);


// var schema = new mongoose.Schema({
// });
