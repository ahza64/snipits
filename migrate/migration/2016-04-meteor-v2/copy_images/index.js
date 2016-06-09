var util = require('dsp_tool/util');
var Asset = require('dsp_model/asset');
var AssetV3 = require('dsp_model/meteor_v3/asset');
var BPromise = require('bluebird');
var mongoose = require('mongoose');

function *run(fix) {
  var asset_count = yield Asset.find().count();
  console.log("asset count", asset_count);
  var batch_size = 100; //arbetrary batch size
  var batches = (asset_count / batch_size);
  for(var i = 0; i < batches; i++) {
    var offset = i * batch_size;    
    var assets = yield Asset.find().sort("created").skip(offset).limit(batch_size);
    var bulk = AssetV3.collection.initializeUnorderedBulkOp();
    for(var j = 0; j < assets.length; j++ ) {
      var asset = JSON.parse(JSON.stringify(assets[j]));
      asset._id = mongoose.Types.ObjectId(asset._id);
      console.log("copying asset", typeof(asset._id), asset._id, offset + j + 1, "of", asset_count);
      bulk.find({_id: asset._id}).upsert().updateOne(asset);
    }
    if(fix) {        
      bulk.executeSync = BPromise.promisify(bulk.execute);
      var result = yield bulk.executeSync();
      console.log("bulk update result", result);
    }      
    
  }
}


if (require.main === module) {
  var baker = require('dsp_tool/baker');
  util.bakerGen(run, {default:true});
  baker.run();
}

module.exports = {
};