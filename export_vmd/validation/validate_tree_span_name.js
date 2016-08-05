var util = require('dsp_shared/lib/cmd_utils');
util.connect(["meteor"]);

var Tree = require('dsp_shared/database/model/tree');
var Cuf = require('dsp_shared/database/model/cuf');

function *validateTreeSpanName() {
  var treesWithoutSpan = yield Tree.find({ span_name: { $or: [ { $exists: false }, { $eq: null } ] } }, { _id: 1 });

  console.log('Trees without span name: ' + treesWithoutSpan);

  return treesWithoutSpan.length === 0;
}

module.exports = { validateTreeSpanName: validateTreeSpanName };
