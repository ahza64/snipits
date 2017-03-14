const path= require('path');
const fs  = require('fs');
const _   = require('underscore');
var mongoose = require('mongoose');
var connection = mongoose.connect('mongodb://localhost:27017/migrate');
var db = mongoose.connection.db;
var dataFolder = '../../buildr-mp/api/soss/sossComponents';
var collectionNames = []

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log(path.resolve(dataFolder));

  console.log();
  main();
});

function main() {
  var files = fs.readdirSync(dataFolder);
  readFolder(dataFolder);
  collectionNames = _.unique(collectionNames);
  console.log("collectionNames =========", collectionNames);
  findDocsByAppId(1);
}

function readFile(filePath){
  var absolutePath = path.resolve(filePath);
  console.log('===============================', absolutePath);
  if( fs.lstatSync(absolutePath).isDirectory() ) {
    console.log('lstatSync');
    readFolder(filePath);
    return;
  }
  if( !filePath.endsWith('.json') ){ return; }
  var file = require(absolutePath);
  collectionNames.push(file.name)
}

function readFolder(filePath) {
  var files = fs.readdirSync(filePath);
  _.each(files, (file) => {
    readFile(path.join(filePath, file))
  })
}

function findDocsByAppId(id) {

  _.each(collectionNames, (name) => {
    console.log("finding id", name);
    var collection = db.collection(name)

    collection.find({id : 48}, (err, res) => {
      if (err) {
        console.error(err);
      }
      console.log("res=========$$$$, ", res);
    });

  })
}
