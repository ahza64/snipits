var patchRegion = require('./fix_missing_region.js');
var utils = require('dsp_shared/lib/cmd_utils');
utils.connect(['meteor']);

function* runPatch(apply) {
  apply = apply || false;
  yield patchRegion(apply);
}

if (require.main === module) {
  var baker = require('dsp_shared/lib/baker');
  utils.bakerGen(runPatch);
  baker.run();
}