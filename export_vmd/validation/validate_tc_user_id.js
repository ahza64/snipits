var util = require('dsp_shared/lib/cmd_utils');
util.connect(["meteor"]);

var Tree = require('dsp_shared/database/model/tree');
var Cuf = require('dsp_shared/database/model/cufs');

function *checkValidTcCufs() {
  var missingCufIds = [];
  var tcUserIds = yield Tree.distinct('tc_user_id', { tc_user_id: { $ne: null } });
  var existingTcUserIds = yield Cuf.find({ _id: { $in: tcUserIds }}, { _id: 1 });
  var missingTcIds = tcUserIds - existingTcUserIds;

  console.log('Trimmers that do not exist: ' + missingCufIds);

  return missingCufIds.length !== 0;
}

module.exports = { checkValidTcCufs: checkValidTcCufs };
