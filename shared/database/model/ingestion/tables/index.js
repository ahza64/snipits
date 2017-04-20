const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const config = require('../../../../conf.d/config.json').mooncake;
const dbUrl = 'postgres://' + config.db_username + ':' + config.db_password + '@localhost:5432/' + config.db_name;
console.log(dbUrl, "connecting")
const sequelize = new Sequelize( dbUrl );
var db = {};

fs
.readdirSync(__dirname)
.filter(function(file) {
  return (file.indexOf('.') !== 0) && (file !== 'index.js');
})
.forEach(function(file) {
  var model = sequelize.import(path.join(__dirname, file));
  db[model.name] = model;
});

Object.keys(db).forEach(function(modelName) {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
