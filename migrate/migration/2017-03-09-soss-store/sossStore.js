var _ = require('underscore');
var mongoose = require('mongoose');
var file = require('./outage_layer.json');

var connection = mongoose.connect('mongodb://localhost:27017/migrate');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Database connected");
});

var fileName = process.argv[2];
var result = {};
var schema = mongoose.Schema.Types;
var mTypes = {
  "string" : schema.String,
  "number" : schema.Number,
  "date"   : schema.Date,
  "boolean": schema.Boolean,
  "object" : schema.Object,
  "array"  : schema.Array
};

_.each(file, function (value, key, {}) {
  var type = typeof value;
  result[key] = type;
  console.log(key , type);
});

var newSchema = new mongoose.Schema(result);
// var model = connection.model(fileName, newSchema);
var Model = mongoose.model(fileName, newSchema);
// var connect = connection.model("schema", newSchema);

var saveSchema = new Model(result);
saveSchema.save(function (err, newSchema) {
  if (err) return console.error(err);
  console.log("added to database");
});


// var schema = new mongoose.Schema({
// });
