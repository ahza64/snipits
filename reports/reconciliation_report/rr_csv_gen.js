// Module
const fs = require('fs');
const co = require('co');
const BPromise = require('bluebird');
const json2csv = require('json2csv');

// Collections
const config = require('dsp_shared/config').get();
require('dsp_shared/database/database')(config.meteor);
const Cuf = require('dsp_shared/database/model/cufs');

// Data and Fields
var getData = require('./rr_get_data');
const fields = require('./rr_fields');
const lib = {
  'tree_inspect': 'vmd_work_packet',
  'tree_trim': 'vmd_work_complete'
};

// Exp: '2016-08-01', '2016-10-31'
var genCsv = co.wrap(function*(startTimeStr, endTimeStr) {
  var companies = yield Cuf.find({}).distinct('company');
  var totalLine = 0;

  for (var i = 0; i < companies.length; i++) {
    var company = companies[i];
    var cuf = yield Cuf.findOne({
      company: company,
      work_type: { $exists: true },
      status: 'active'
    });
    var workType = cuf.work_type;
    if (typeof workType !== 'string') {
      workType = workType[0];
    }

    var data = yield getData(
      new Date(startTimeStr),
      new Date(endTimeStr),
      workType,
      lib[workType],
      company
    );
    totalLine += data.length;
    var csv = json2csv({ data: data, fields: fields });
    
    fs.writeFileAsync = BPromise.promisify(fs.writeFile);
    yield fs.writeFileAsync(
      __dirname + '/csv/' + company + '_reconciliation_report_' + startTimeStr + '-' + endTimeStr + '.csv',
      csv
    );

    console.log('===============================');
    console.log('report generated in -> ', __dirname);
    console.log('total records generated -> ', totalLine);
  }
});

genCsv('2016-11-7', '2016-11-11');

module.exports = genCsv;
