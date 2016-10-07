// Module
const fs = require('fs');
const co = require('co');
const BPromise = require('bluebird');
const json2csv = require('json2csv');

// Data and Fields
var getData = require('./user_activity');
const fields = require('./fields');

var genCsv = co.wrap(function*() {
  var data = yield getData();  
  console.log('DATA: ', data);
  
  var csv = json2csv({ data: data, fields: fields });
  fs.writeFileAsync = BPromise.promisify(fs.writeFile);
  yield fs.writeFileAsync(__dirname + '/user_activity_report.csv', csv);

  console.log('report generated in -> ', __dirname);
});

genCsv();