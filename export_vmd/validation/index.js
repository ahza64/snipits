require('dsp_shared/config/config').get('meteor');
const utils = require('dsp_shared/lib/cmd_utils');
const validateMissingFields = require('./validate_address');
const validateWorkorder = require('./validate_tree_workorder');
const validateTcUserId = require('./validate_tc_user_id');
const validateUserIssues = require('./validate_user_issues');

require('sugar');
utils.connect(['meteor']);

function *run() {
  var fieldsExist = yield validateMissingFields.checkAll();
  var correctTreesInWO = yield validateWorkorder.validateTreeWorkorders();
  var correctTrimmers = yield validateTcUserId.checkValidTcCufs();
  var correctUsers = yield validateUserIssues.checkTreesMissingUsers();
  return fieldsExist && correctTreesInWO && correctTrimmers && correctUsers;
}

//baker module
if (require.main === module) {
  var baker = require('dsp_shared/lib/baker');
  utils.bakerGen(run, { opts: 'params', default: true });
  baker.run();
}

module.exports = { run: run };
