// Dependencies
const co = require('co');
const BPromise = require('bluebird');
const config = require('dsp_shared/config/config').get({ log4js: false });
require('dsp_shared/database/database')(config.meteor);
const Trees = require('dsp_shared/database/model/tree');
const Assets = require('dsp_shared/database/model/assets');
Assets.findOneAndUpdateAsync = BPromise.promisify(Assets.findOneAndUpdate);
var tcAssetsLib = require('./gen_tc_asset_lib')();

// Patch tc img
var patchTcImg = co.wrap(function*(run) {
  for (var logRrcId in tcAssetsLib) {
    if (!tcAssetsLib.hasOwnProperty(logRrcId)) { continue; }

    var logAsset = tcAssetsLib[logRrcId];
    try {
      // Check if db has the asset
      var dbAsset = yield Assets.findOne({ data: logAsset.data });
      if (dbAsset) {
        console.log('existing ressourceId -> ', dbAsset.ressourceId);
        console.log('log ressourceId      -> ', logAsset.ressourceId);
      } else {
        // Does not have, patch asset
        if (run) {
          yield Assets.findOneAndUpdateAsync({ ressourceId: logRrcId }, logAsset, { upsert: true });
        }
        console.log('add new tc image     -> ', logAsset.ressourceId);
      }
      
      // Patch tc_image based on ressourceId
      var dbTree = yield Trees.findOne({ local_id: logRrcId });
      if (dbTree && !dbTree.tc_image) {
        var tcImageId = yield Assets.findOne({ ressourceId: logRrcId });
        console.log('before tc_image      -> ', dbTree.tc_image);
        console.log('after tc_image       -> ', tcImageId._id);
        if (run) {
          yield Trees.update({ local_id: logRrcId }, { tc_image: tcImageId._id });
        }
      }
      console.log('----------------------');
    } catch(e) {
      console.error(e);
    }
  }

  console.log('DONE');
});

module.exports = patchTcImg;
