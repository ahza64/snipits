const _ = require('underscore');
const excludedKeys = ['image', 'tc_image', 'ntw_image', 'assignment_complete'];
const timeKeys = [
  'tc_start_time', 'tc_complete_time',
  'pi_start_time', 'pi_complete_time', 
  'commented_at', 'updated', 'created'
];

var getDiff = function(treeInLog, treeInDb) {
  var diffs = {};

  for (var key in treeInLog) {
    if (treeInLog.hasOwnProperty(key) && !_.contains(excludedKeys, key)) {
      if (treeInLog[key] + '' === treeInDb[key] + '') {
        continue;
      }

      if (_.contains(timeKeys, key)) {
        diffs[key] = new Date(treeInLog[key]);
      } else {
        diffs[key] = treeInLog[key];
      }
    }
  }

  return diffs;
};

module.exports = getDiff;