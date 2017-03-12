const path= require('path');
const fs  = require('fs');
const _   = require('underscore');
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
  main();
});


function main() {
  for (var i = 2; i < process.argv.length; i++) {
    var filePath = './' + process.argv[i];
    filePath = path.resolve(filePath);
    migrateFile(filePath);
  }
}

function migrateFolder(filePath){
  var directoryFiles = fs.readdirSync(filePath);
  _.each(directoryFiles, (file) => {
    migrateFile(path.join(filePath, file));
  });
}

function migrateFile(filePath) {
  var Model;
  var filePathObject = path.parse(filePath);
  if (fs.lstatSync(filePath).isDirectory()){
    migrateFolder(filePath);
    return;
  }
  if (filePathObject.ext !== '.json') {
    console.error("not a .json F");
    return;
  }
  var file = require(filePath);
  var result = {};

  _.each(file, (value, key, {}) => {
    var type = typeof value;
    result[key] = type;
  });
  result.project  = mTypes['string'];
  result.company  = mTypes['string'];
  var newSchema = new mongoose.Schema(result);

  _.each(file, (value, key, {}) => {
    result[key] = value
  });
  result.project  = 'text';
  result.company  = 'text';

  if (mongoose.models[file.name]) {
    Model = mongoose.model(file.name)
  } else {
    Model = mongoose.model(file.name, newSchema, file.name);
  }

  var saveSchema = new Model(result);
  saveSchema.save((err, newSchema) => {
    if (err) {
      console.error("FAILED:", err, filePath);
    } else {
      console.log("success: ", file.name, filePath);
    }
  });

}
