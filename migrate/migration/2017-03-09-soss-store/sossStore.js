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
    var filePath
    filePath = process.cwd() + '/' + process.argv[i];
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
  if (fs.lstatSync(filePath).isDirectory()){
    migrateFolder(filePath);
    return;
  }
  var Model;
  var schemaFormat = {};
  var doc = {};
  var file = require(filePath);

  if (!mongoose.models[file.name]) {
    _.each(file, (value, key, {}) => {
      var type = typeof value;
      schemaFormat[key] = type;
    });
    schemaFormat.project  = mTypes['string'];
    schemaFormat.company  = mTypes['string'];
    var newSchema = new mongoose.Schema(schemaFormat);
    Model = mongoose.model(file.name, newSchema, file.name);
  } else {
    Model = mongoose.model(file.name);
  }

  _.each(file, (value, key, {}) => {
    doc[key] = value
  });
  doc.project  = 'text';
  doc.company  = 'text';

  var newDoc = new Model(doc);
  newDoc.save((err) => {
    if (err) {
      console.trace("FAILED:", err, filePath);
    } else {
      console.info('.');
    }
  });

}
