const path= require('path');
const fs  = require('fs');
const _   = require('underscore');
var mongoose = require('mongoose');
var connection = mongoose.connect('mongodb://localhost:27017/migrate');
var db = mongoose.connection;
// var sType = mongoose.Schema.Types;
// var mTypes = {
//   "string" : sType.String,
//   "number" : sType.Number,
//   "date"   : sType.Date,
//   "boolean": sType.Boolean,
//   "object" : sType.Object,
//   "array"  : sType.Array
// };

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Database connected");
 main();
});

function main() {
  console.log("db==========>", db);

}

function migrateFolder(filePath){

}

function migrateFile(filePath) {}
