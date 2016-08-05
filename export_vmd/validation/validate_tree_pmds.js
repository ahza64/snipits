var util = require('dsp_shared/lib/cmd_utils');
util.connect(["meteor"]);

var Tree = require('dsp_shared/database/model/tree');
var Cuf = require('dsp_shared/database/model/cuf');

function *validateTreePmds() {
  var treesWithoutPmd = yield Tree.find({ pge_pmd_num: { $or: [ { $exists: false }, { $eq: null } ] } }, { _id: 1 });

  console.log('Trees without pmd number: ' + treesWithoutPmd);

  return treesWithoutPmd.length === 0;
}

module.exports = { validateTreePmds: validateTreePmds };
