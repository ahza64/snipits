/**
 * @description Tools for checking if trees collection missing county/city/address/street
 */
var util = require('dsp_shared/lib/cmd_utils');
util.connect(['meteor']);
var TREE = require('dsp_shared/database/model/tree');

function *checkIfMiss(attr) {
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

  return totalMissing === 0;
}

function *checkIfPmdNumMissing() {
  return yield checkIfMiss('pge_pmd_num');
}

function *checkIfSpanNameMissing() {
  return yield checkIfMiss('span_name');
}

function *checkIfCountyMissing () {
  return yield checkIfMiss('county');
}

function *checkIfCityMissing () {
  return yield checkIfMiss('city');
}

function *checkIfZipcodeMissing () {
  return yield checkIfMiss('zipcode');
}

function *checkAll() {
  var valid = yield checkIfMiss('county');
  valid = yield checkIfMiss('city');
  valid = yield checkIfMiss('zipcode');
  valid = yield checkIfMiss('pge_pmd_num');
  valid = yield checkIfMiss('span_name');

  return valid;
}

// export
module.exports = {
  checkAll: checkAll
};
