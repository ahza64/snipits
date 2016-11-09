// Dependencies
const co = require('co');
const mongoose = require('mongoose');
const moment = require('moment');
const config = require('dsp_shared/config/config').get({ log4js: false });
require('dsp_shared/database/database')(config.meteor);
const Trees = require('dsp_shared/database/model/tree');
const genTcImgGrep = require('./gen_tc_grep');
const treeIdPos = 2;
const treeObjPos = 3;

// Results container
var treeLib = {};
var unpatchedTrees = [];
var badTcImageTrees = [];
var allLocalIds = [];


// Check trees that missing patch
var check = co.wrap(function*() {
  var logs = require('./logs/missing_patch_log.json');

  // Sort by time
  logs = logs.sort((a, b) => {
    return moment(a.date).valueOf() - moment(b.date).valueOf();
  });

  // Create hashtable
  logs.forEach(l => {
    var id = l.data[treeIdPos];
    treeLib[id] = l;
  });

  for (var treeId in treeLib) {
    if (!treeLib.hasOwnProperty(treeId)) { continue; }

    var logTree = treeLib[treeId].data[treeObjPos];

    try {
      var dbTree = yield Trees.findOne({ _id: mongoose.Types.ObjectId(treeId) });
      if (!dbTree) { continue; }
    } catch(e) {
      console.error(e);
    }

    var dbTreeUpdate = moment(dbTree.updated).valueOf();
    var logTreeUpdate = moment(treeLib[treeId].date).valueOf();
    if (dbTreeUpdate < logTreeUpdate) {
      var tcImageId = dbTree.tc_image || '';
      var isTcImageIdCorrect = tcImageId.toString().match(/tc_image/g) ? false : true;

      // Mssing or bad tc_image id
      if (!tcImageId || (tcImageId && !isTcImageIdCorrect)) {
        badTcImageTrees.push(treeId);
        if (logTree.local_id) {
          allLocalIds.push(logTree.local_id);
        }
      }

      // Missing patch
      unpatchedTrees.push(treeId);
    }
  }

  console.log('missed patch trees are: \n', unpatchedTrees);
  console.log('bad/missing tc image trees are: \n', badTcImageTrees);
  console.log('local ids for tc image: \n', allLocalIds);
  console.log('tc img grep: \n', genTcImgGrep(allLocalIds, 'tc_image', 'tc_img_log'));

  return {
    patch: unpatchedTrees,
    tcImage: badTcImageTrees,
    treeLib: treeLib
  };
});

if (require.main === module) {
  check();
}

module.exports = check;