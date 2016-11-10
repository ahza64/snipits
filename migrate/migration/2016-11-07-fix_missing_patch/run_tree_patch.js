var patchTrees = require('./patch_trees.js');
var utils = require('dsp_shared/lib/cmd_utils');
utils.connect(['meteor']);

function* runPatch(apply) {
  apply = apply || false;
  yield patchTrees(apply);
}

if (require.main === module) {
  var baker = require('dsp_shared/lib/baker');
  utils.bakerGen(runPatch);
  baker.run();
}