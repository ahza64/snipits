const moment = require('moment');

module.exports = function() {
  var tcAssetsLib = {};
  var logTcAssets = require('./logs/tc_img_log.json');
  logTcAssets = logTcAssets.sort(function(a, b) {
    return moment(a.date).valueOf() - moment(b.date).valueOf();
  });
  for (var i = 0; i < logTcAssets.length; i++) {
    var asset = logTcAssets[i].data[0].body;
    tcAssetsLib[asset.ressourceId] = asset;
  }

  return tcAssetsLib;
};