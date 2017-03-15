const path= require('path');
const fs  = require('fs');
const _   = require('underscore');
const async = require('async');
var mongoose = require('mongoose');
var connection = mongoose.connect('mongodb://localhost:27017/migrate');
var db = mongoose.connection.db;
var sType = mongoose.Schema.Types;
var mTypes = {
  "string" : sType.String,
  "number" : sType.Number,
  "date"   : sType.Date,
  "boolean": sType.Boolean,
  "object" : sType.Object,
  "array"  : sType.Array
};

var dataFolder = '../../buildr-mp/api/soss/sossComponents';
const appId = 48;
var Models = {};
var collectionNames = []

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("connected to DB");
  main();
});

function main() {
  var files = fs.readdirSync(dataFolder);
  readFolder(dataFolder);
  collectionNames = _.unique(collectionNames);
  var sossApp = findDocsByAppId(appId, (res) => {
    outputJSON(res);
   });
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
  async.each(files, (file) => {
    readFile(path.join(filePath, file))
  })
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

function findDocsByAppId(id, callback) {
  async.each(collectionNames, (name) => {
    var Model = Models[name];
    Model
    .find({ appId : id })
    .then( (res, err) => {
      if (err) {
        console.error('errr',err);
      } else {
        console.log(res);
        callback(res);
      }
    });
  })
}

function outputJSON(res) {
  var result ={};
  async.each(res, (json) => {
    json = json.toObject();
    var pathx = path.resolve( dataFolder, 'output' , json.fileName);
    console.log(pathx);
    fs.writeFileSync(pathx, JSON.stringify(json), (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log("OK");
      }
    });
  })
}
