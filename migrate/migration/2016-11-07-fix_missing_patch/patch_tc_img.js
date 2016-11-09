// Dependencies
const co = require('co');
const BPromise = require('bluebird');
const config = require('dsp_shared/config/config').get({ log4js: false });
require('dsp_shared/database/database')(config.meteor);
const Assets = require('dsp_shared/database/model/assets');
Assets.findOneAndUpdateAsync = BPromise.promisify(Assets.findOneAndUpdate);
var tcAssetsLib = require('./gen_tc_asset_lib')();

// Patch tc img
var patchTcImg = co.wrap(function*() {
  for (var logRrcId in tcAssetsLib) {
    if (!tcAssetsLib.hasOwnProperty(logRrcId)) { continue; }

    var logAsset = tcAssetsLib[logRrcId];
    try {
      // Check if db has the asset
      var dbAsset = yield Assets.findOne({ data: logAsset.data });
      console.log('====> ', logRrcId);
      if (dbAsset) {
        console.log('existing ressourceId -> ', dbAsset.ressourceId);
        console.log('log ressourceId -> ', logAsset.ressourceId);
        console.log('----------------------');
        continue;
      }
      
      // Does not have, upsert asset
      yield Assets.findOneAndUpdateAsync({ ressourceId: logRrcId }, logAsset, { upsert: true });
      console.log('ressourceId -> ', logRrcId);
      console.log('log ressourceId -> ', logAsset.ressourceId);
      console.log('----------------------');
    } catch(e) {
      console.error(e);
    }
  }

  console.log('DONE');
});

patchTcImg();
