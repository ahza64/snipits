// Module
const fs = require('fs');
const co = require('co');
const BPromise = require('bluebird');
const json2csv = require('json2csv');

// Data and Fields
var getData = require('./rr_get_data');
const fields = require('./rr_fields');
const reportConfig = {
  start: '2016-08-01',
  end: '2016-10-31',
  crewType: 'pi',
  exportType: 'vmd_work_packet'
  //crewType: 'tc',
  //exportType: 'vmd_work_complete'
};

var genCsv = co.wrap(function*() {
  var data = yield getData(
    new Date(reportConfig.start),
    new Date(reportConfig.end),
    reportConfig.crewType,
    reportConfig.exportType
  );
  var csv = json2csv({ data: data, fields: fields });
  fs.writeFileAsync = BPromise.promisify(fs.writeFile);
  yield fs.writeFileAsync(
    __dirname + '/' + reportConfig.crewType + '_' +
    'reconciliation_report_' + reportConfig.start + 
    '-' + reportConfig.end + '.csv',
    csv
  );

  console.log('report generated in -> ', __dirname);
});

genCsv();