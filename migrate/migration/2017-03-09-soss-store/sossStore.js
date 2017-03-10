const path = require('path');
var _ = require('underscore');
var mongoose = require('mongoose');

var connection = mongoose.connect('mongodb://localhost:27017/migrate');
var db = mongoose.connection;
var sType = mongoose.Schema.Types;
var mTypes = {
  "string" : sType.String,
  "number" : sType.Number,
  "date"   : sType.Date,
  "boolean": sType.Boolean,
  "object" : sType.Object,
  "array"  : sType.Array
};

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Database connected");
});

for (var i = 2; i < process.argv.length; i++) {
  var filePath = './' + process.argv[i];
  migrateToMongo(path.resolve(filePath));
}

function migrateToMongo(filePath) {
  var result = {};
  var file = require(filePath);
  _.each(file, (value, key, {}) => {
    var type = typeof value;
    result[key] = type;
  });
  var newSchema = new mongoose.Schema(result);

  _.each(file, (value, key, {}) => {
     result[key] = value
   });
  var Model = mongoose.model(file.name, newSchema);
  var saveSchema = new Model(result);
  console.log(filePath);
  saveSchema.save( (err, newSchema) => {
    if (err) { return console.error(err); }
    console.log("added to database");
  });
}
