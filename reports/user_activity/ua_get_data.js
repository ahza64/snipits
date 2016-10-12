//Third party module
const co = require('co');
const BPromise = require('bluebird');
const moment = require('moment');
const _ = require('underscore');

// Dispatchr module
const config = require('dsp_shared/config').get();
require('dsp_shared/database/database')(config.meteor);
const User = require('dsp_shared/database/model/users');

module.exports = co.wrap(function*() {

  // Get the data
  User.aggregateAsync = BPromise.promisify(User.aggregate);
  var res = yield User.aggregateAsync([
    {
      $project: {
        _id: 1,
        logins: '$services.resume.loginTokens.when'
      }
    }
  ]);

  // Format the data
  res.forEach(doc => {
    var logins = doc.logins;
    if (!logins) { return; }

    var hash = {};
    logins.forEach(time => {
      time = moment(time).format('l');
      hash[time] = hash[time] === undefined ? 1 : hash[time] + 1;
    });
    doc.logins = hash;
  });

  // Group data by id
  res = _.indexBy(res, '_id');
  for (var _id in res) {
    if (res.hasOwnProperty(_id)) {
      res[_id] = res[_id].logins;
    }
  }
  
  // Big Hash
  var dateHash = {};
  for (var user in res) {
    if (!res.hasOwnProperty(user)) { continue; }

    var logins = res[user];
    for (var time in logins) {
      if (!logins.hasOwnProperty(time)) { continue; }

      dateHash[time] = dateHash[time] === undefined ? 1 : dateHash[time] + 1;
    }
  }

  // Data massage for CSV
  var csvData = [];
  for (var date in dateHash) {
    if (!dateHash.hasOwnProperty(date)) { continue; }
    
    var dateTemp = date.split('/').map(d => parseInt(d));
    var sort = dateTemp[0] * 30 + dateTemp[1] + dateTemp[2] * 365;
    csvData.push({
      date: date,
      count: dateHash[date],
      sort: sort
    });
  }

  csvData = _.sortBy(csvData, 'sort');
  
  return csvData;
});