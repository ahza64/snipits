// Dependencies
const co = require('co');
const BPromise = require('bluebird');
const mongoose = require('mongoose');
const _ = require('underscore');
const utils = require('dsp_shared/lib/cmd_utils');
utils.connect(['meteor']);
const Trees = require('dsp_shared/database/model/tree');
Trees.findOneAndUpdateAsync = BPromise.promisify(Trees.findOneAndUpdate);
const excludedKeys = ['image', 'tc_image', 'ntw_image', 'assignment_complete'];

var getDiff = function(treeInLog, treeInDb) {
  var diffs = {};

  for (var key in treeInLog) {
    if (treeInLog.hasOwnProperty(key) && !_.contains(excludedKeys, key)) {
      if (treeInLog[key] + '' === treeInDb[key] + '') {
        continue;
      }

      diffs[key] = treeInLog[key];
    }
  }

  return diffs;
};

var patchMissedPatch = co.wrap(function*() {
  var problemLib = yield require('./find_missing_patch.js')();
  var missingPatchTreeIds = problemLib.patch;
  var treeLib = problemLib.treeLib;

  for (var i = 0; i < missingPatchTreeIds.length; i++) {
    var id = missingPatchTreeIds[i];
    var treeInLog = treeLib[id].data[3];
    try {
      var treeInDb = yield Trees.findOne({ _id: mongoose.Types.ObjectId(id) });
    } catch(e) {
      console.error(e);
    }
    var diffs = getDiff(treeInLog, treeInDb);
    console.log(id, '========> ', diffs);
    console.log('-----------------------------');
    /*try {
      yield Trees.findOneAndUpdateAsync({ _id: mongoose.Types.ObjectId(id) }, { $set: diffs });
    } catch(e) {
      console.error(e);
    }*/
  }

  console.log('DONE');
});

patchMissedPatch();
