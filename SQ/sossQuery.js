const path= require('path');
const fs  = require('fs');
const _   = require('underscore');
var mongoose = require('mongoose');
var connection = mongoose.connect('mongodb://localhost:27017/migrate');
var db = mongoose.connection.db;
var Models = {};
var dataFolder = '../../buildr-mp/api/soss/sossComponents';
var collectionNames = []
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
  main();
});

function main() {
  var result = {};
  var files = fs.readdirSync(dataFolder);
  readFolder(dataFolder);
  collectionNames = _.unique(collectionNames);

  var sossApp = findDocsByAppId(12, (res) => {
    result = _.union(result, res);
    console.log(result);
   });

}

function ripSchema(file) {
  var Model;
  var schemaFormat = {};
  var doc = {};
  if (!mongoose.models[file.name]) {
    _.each(file, (value, key, {}) => {
      var type = typeof value;
      schemaFormat[key] = type;
    });
    schemaFormat.appId  = mTypes['string'];
    var newSchema = new mongoose.Schema(schemaFormat);
    Model = mongoose.model(file.name, newSchema, file.name);
  } else {
    Model = mongoose.model(file.name);
  }
  Models[file.name] = Model;
}

function readFile(filePath){
  var absolutePath = path.resolve(filePath);
  if( fs.lstatSync(absolutePath).isDirectory() ) {
    readFolder(filePath);
    return;
  }
  if( !filePath.endsWith('.json') ){ return; }
  var file = require(absolutePath);
  collectionNames.push(file.name);
  ripSchema(file);
}

function readFolder(filePath) {
  var files = fs.readdirSync(filePath);
  _.each(files, (file) => {
    readFile(path.join(filePath, file))
  })
}

function findDocsByAppId(id, callback) {
  var result = [];
  _.each(collectionNames, (name) => {
    var Model = Models[name];
    Model
    .find({ appId : id })
    .then( (res, err) => {
      if (err) {
        console.error('errr',err);
      } else {
        callback(res)
      }
    });
  })
}
