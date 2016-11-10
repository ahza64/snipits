var patchTcImg = require('./patch_tc_img.js');
var utils = require('dsp_shared/lib/cmd_utils');
utils.connect(['meteor']);

function* runPatch(apply) {
  apply = apply || false;
  yield patchTcImg(apply);
}

if (require.main === module) {
  var baker = require('dsp_shared/lib/baker');
  utils.bakerGen(runPatch);
  baker.run();
}