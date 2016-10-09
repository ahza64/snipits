// Module
const fs = require('fs');
const co = require('co');
const BPromise = require('bluebird');
const json2csv = require('json2csv');

// Data and Fields
var getData = require('./rr_get_data');
const fields = require('./rr_fields');

var genCsv = co.wrap(function*() {
  var data = yield getData(new Date('2016-08-01'), new Date('2016-09-01'));

  var csv = json2csv({ data: data, fields: fields });
  fs.writeFileAsync = BPromise.promisify(fs.writeFile);
  yield fs.writeFileAsync(__dirname + '/reconciliation_report.csv', csv);

  console.log('report generated in -> ', __dirname);
});

genCsv();