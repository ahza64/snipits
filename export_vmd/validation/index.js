require('dsp_shared/config/config').get('meteor');
const utils = require('dsp_shared/lib/cmd_utils');
utils.connect(['meteor', 'postgres']);

const validateMissingFields = require('./validate_address');
const validateWorkorder = require('./validate_tree_workorder');
const validateTcUserId = require('./validate_tc_user_id');
const validateUserIssues = require('./validate_user_issues');

require('sugar');


function *run() {
  var fieldsExist = yield validateMissingFields.checkAll();
  var correctTreesInWO = yield validateWorkorder.validateTreeWorkorders();
  var correctTrimmers = yield validateTcUserId.checkValidTcCufs();
  var correctUsers = yield validateUserIssues.checkTreesMissingUsers();
  return fieldsExist && correctTreesInWO && correctTrimmers && correctUsers;
}

function *fixes() {
  yield require("dsp_migration/2016-06-16-validate_species/validateSpecies").getBadSpecies(true);
  yield require("dsp_migration/2016-06-09_user_company_migration/migrate_all")();
  yield require("dsp_migration/2016-09-20-fix_tree_source/tree_source")(true);
  yield require("dsp_migration/2016-09-20-add_pi_to_tc_added_tree/add_pi_data")(true);
  yield require("dsp_migration/2016-10-24-set_pi_time_on_trimmed/set_pi_complete_time")(true);
}

//baker module
if (require.main === module) {
  var baker = require('dsp_shared/lib/baker');
  utils.bakerGen(run, { opts: 'params', default: true });
  utils.bakerGen(fixes);
  baker.run();
}

module.exports = { run: run, fixes: fixes };
