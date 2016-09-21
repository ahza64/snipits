var util = require('dsp_shared/lib/cmd_utils');

var c_to_m = require('./add_company_to_managers');
var c_to_c = require('./add_company_to_cufs');


function *fixAll() {
  yield c_to_m.addCompanyToManagers('ManagR_Users.csv');
  yield c_to_m.addCompanyToManagers('PlanR_Users.csv');
  yield c_to_c.addCompanyToCufs('ManagR_Users.csv');
  yield c_to_c.addCompanyToCufs('PlanR_Users.csv');
}

// baker module
if (require.main === module) {
  util.bakerGen(fixAll, {default:true});
  util.bakerRun();
}

module.exports = fixAll;