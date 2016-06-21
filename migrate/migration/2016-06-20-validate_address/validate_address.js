/**
 * @description Tools for checking if trees collection missing county/city/address/street
 */
var util = require('dsp_shared/lib/cmd_utils');
util.connect(['meteor']);
var TREE = require('dsp_shared/database/model/tree');

function *checkIfMiss (attr) {
  var res = {};
  var field = {_id: 1};
  var query = {
    project: 'transmission_2015',
    status: {$regex: /^[^06]/}
  };
  query[attr] = {$exists: false};
  var missingCount = yield TREE.find(query, field).count();
  query[attr] = {$exists: true, $eq: null};
  var nullCount = yield TREE.find(query, field).count();

  res[attr + 'Missing'] = missingCount;
  res[attr + 'Null'] = nullCount;

  return res;
}

function *checkIfCountyMissing () {
  return yield checkIfMiss('county');
}

function *checkIfCityMissing () {
  return yield checkIfMiss('city');
}

function *checkIfStreetMissing () {
  return yield checkIfMiss('streetName');
}

function *checkIfAddressMissing () {
  return yield checkIfMiss('address');
}

function help () {
  return 'Here is the options: ' +
    'checkIfCountyMissing, ' +
    'checkIfCityMissing, ' +
    'checkIfStreetMissing, ' + 
    'checkIfAddressMissing';
}

// baker module
if (require.main === module) {
  var baker = require('dsp_shared/lib/baker');
  baker.command(help, {default: true});
  util.bakerGen(checkIfCountyMissing);
  util.bakerGen(checkIfCityMissing);
  util.bakerGen(checkIfAddressMissing);
  util.bakerGen(checkIfStreetMissing);
  baker.run();
}

// export
module.exports = {
  checkIfCountyMissing: checkIfCountyMissing,
  checkIfCityMissing: checkIfCityMissing,
  checkIfStreetMissing: checkIfStreetMissing,
  checkIfAddressMissing: checkIfAddressMissing
};