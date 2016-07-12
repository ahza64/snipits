require('dsp_shared/config/config').get('meteor');
const utils = require('dsp_shared/lib/cmd_utils');
const validateMissingFields = require('./validate_address');
const validateWorkorder = require('./validate_tree_workorder');
const validateTcUserId = require('./validate_tc_user_id');

require('sugar');
utils.connect(['meteor']);

function *run() {
  var valid = true;
  var valid = yield validateMissingFields.checkAll();
  valid = yield validateWorkorder.validateTreeWorkorders();
  valid = yield validateTcUserId.checkValidTcCufs();
  return valid
}

//baker module
if (require.main === module) {
  var baker = require('dsp_shared/lib/baker');
  utils.bakerGen(run, { opts: 'params', default: true });
  baker.run();
}

