/**
 * @description Tools for checking if trees collection missing county/city/address/street
 */
var util = require('dsp_shared/lib/cmd_utils');
util.connect(['meteor']);
var TREE = require('dsp_shared/database/model/tree');

function *checkIfExists(attr) {
  var res = {};
  var field = { _id: 1 };
  var query = {
    project: 'transmission_2015',
    status: { $regex: /^[^06]/ }
  };

  query[attr] = { $exists: false };
  var missingCount = yield TREE.find(query, field).count();
  query[attr] = {$exists: true, $eq: null};
  var nullCount = yield TREE.find(query, field).count();
  var totalMissing = missingCount + nullCount;

  console.log('Trees without ' + attr + ': ' + totalMissing);

  return totalMissing >= 0;
}

function *checkAll() {
  var validCounty = yield checkIfExists('county');
  var validCity   = yield checkIfExists('city');
  var validZip    = yield checkIfExists('zipcode');
  var validPMD    = yield checkIfExists('pge_pmd_num');
  var validSpan   = yield checkIfExists('span_name');

  return validCounty && validCity && validZip && validPMD && validSpan;
}

// export
module.exports = {
  checkAll: checkAll
};
