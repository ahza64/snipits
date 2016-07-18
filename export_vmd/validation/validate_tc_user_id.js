var util = require('dsp_shared/lib/cmd_utils');
util.connect(["meteor"]);
var _ = require("underscore");
var Tree = require('dsp_shared/database/model/tree');
var Cuf = require('dsp_shared/database/model/cufs');

function *checkValidTcCufs() {
  var tcUserIds = yield Tree.distinct('tc_user_id', { tc_user_id: { $ne: null } });
  var existingTcUserIds = yield Cuf.find({ _id: { $in: tcUserIds }}, { _id: 1 });
  
  tcUserIds = _.map(tcUserIds, id => id.toString());
  existingTcUserIds = _.map(existingTcUserIds, tree => tree._id.toString());
  
  var missingTcIds = _.difference(tcUserIds, existingTcUserIds);
  
  console.log('Trimmers that do not exist: ', missingTcIds);

  return missingTcIds.length === 0;
}

module.exports = { checkValidTcCufs: checkValidTcCufs };
