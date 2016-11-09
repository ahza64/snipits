// Dependencies
const co = require('co');
const BPromise = require('bluebird');
const mongoose = require('mongoose');
const config = require('dsp_shared/config/config').get({ log4js: false });
require('dsp_shared/database/database')(config.meteor);
const Assets = require('dsp_shared/database/model/assets');
const Trees = require('dsp_shared/database/model/tree');
Trees.findOneAndUpdateAsync = BPromise.promisify(Trees.findOneAndUpdate);
var getDiff = require('./get_diff');
var tcAssetsLib = require('./gen_tc_asset_lib')();

// Patch Trees
var patchMissedPatch = co.wrap(function*() {
  var lib = yield require('./find_missing_patch.js')();
  var treeIds = lib.patch;
  var treeLib = lib.treeLib;

  for (var i = 0; i < treeIds.length; i++) {
    var tcAsset = null, tcAssetId = null, dbRrcId = null;
    var id = treeIds[i];
    var logTree = treeLib[id].data[3];
    var mongoId = mongoose.Types.ObjectId(id);

    try {
      var dbTree = yield Trees.findOne({ _id: mongoId });
      var logRrcId = logTree.local_id;
      if (logRrcId && tcAssetsLib[logRrcId]) {
        tcAsset = yield Assets.findOne({ data: tcAssetsLib[logRrcId].data });
        tcAssetId = tcAsset && tcAsset._id;
        dbRrcId = tcAsset && tcAsset.ressourceId;
      }
      
      var diffs = getDiff(logTree, dbTree);
      // Add local_id
      if (dbRrcId) {
        diffs.local_id = dbRrcId;
      }
      // Add tc_image
      if (tcAssetId) {
        diffs.tc_image = tcAssetId;
      }

      yield Trees.findOneAndUpdateAsync({ _id: mongoId }, { $set: diffs });
      console.log('------------------');
      console.log('tree id -> \n', id);
      console.log('updates -> \n', diffs);
    } catch(e) {
      console.error(e);
    }
  }

  console.log('DONE');
});

patchMissedPatch();
