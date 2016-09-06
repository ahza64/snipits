var fix_assets = require('./fix_asset_data.js');
var utils = require('dsp_shared/lib/cmd_utils');
utils.connect(['meteor']);
function *run(push){
  push = push || false;
  yield fix_assets( push );
}

if (require.main === module) {
  var baker = require('dsp_shared/lib/baker');
  utils.bakerGen(run, {default:true});
  baker.run();
}
