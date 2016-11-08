// Dependencies
const co = require('co');
const mongoose = require('mongoose');
const moment = require('moment');
const utils = require('dsp_shared/lib/cmd_utils');
utils.connect(['meteor']);
const Trees = require('dsp_shared/database/model/tree');
var logs = require('./logs/missing_patch_log.json');
const treeIdPos = 2;

// Results container
var missPatchedTrees = [];
var nullTrees = [];
var badImageTrees = [];
var badTcImageTrees = [];
var badNtwImageTrees = [];

var check = co.wrap(function*() {

  // Sort by time
  logs = logs.sort((a, b) => {
    return moment(a.date).valueOf() - moment(b.date).valueOf();
  });

  var treeLib = {};
  logs.forEach(l => {
    var id = l.data[treeIdPos];
    treeLib[id] = l;
  });

  for (var treeId in treeLib) {
    if (treeLib.hasOwnProperty(treeId)) {
      try {
        var treeInDb = yield Trees.findOne({ _id: mongoose.Types.ObjectId(treeId) });
        if (!treeInDb) {
          nullTrees.push(treeId);
          continue;
        }
      } catch(e) {
        console.error(e);
      }

      var imageId = treeInDb.image || '';
      var tcImageId = treeInDb.tc_image || '';
      var ntwImageId = treeInDb.ntw_image || '';
      var treeUpdateAt = moment(treeInDb.updated).valueOf() + 7 * 3600 * 1000;
      var treePatchedAt = moment(treeLib[treeId].date).valueOf();
      var isPatchWorking = treeUpdateAt > treePatchedAt;

      var isImageIdCorrect = imageId.toString().match(/image/g) ? false : true;
      var isTcImageIdCorrect = tcImageId.toString().match(/tc_image/g) ? false : true;
      var isNtwImageIdCorrect = ntwImageId.toString().match(/ntw_image/g) ? false : true;

      if (!isImageIdCorrect) {
        badImageTrees.push(treeId);
      } else if (!isTcImageIdCorrect) {
        badTcImageTrees.push(treeId);
      } else if (!isNtwImageIdCorrect) {
        badNtwImageTrees.push(treeId);
      } else if (!isPatchWorking) {
        missPatchedTrees.push(treeId);
      }
    }
  }

  console.log('-----> null trees are: ', nullTrees);
  console.log('=====> missed patch trees are: ', missPatchedTrees);
  console.log('=====> bad image trees are: ', badImageTrees);
  console.log('=====> bad tc image trees are: ', badTcImageTrees);
  console.log('=====> bad ntw image trees are: ', badNtwImageTrees);

  return {
    patch: missPatchedTrees,
    image: badImageTrees,
    tcImage: badTcImageTrees,
    ntwImage: badNtwImageTrees,
    treeLib: treeLib
  };
});

//check();

module.exports = check;