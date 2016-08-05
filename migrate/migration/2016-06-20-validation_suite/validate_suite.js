var util = require('dsp_shared/lib/cmd_utils');
var addressCheck = require('../2016-06-20-validate_address/validate_address');
var trimCodeCheck = require('../2016-06-14-validate_trim_codes/validate_trim_code');
var speciesCheck = require('../2016-06-16-validate_species/validateSpecies');
var pmdCheck = require('../2016-06-14-pmds_with_letters/pmdsWithLetters');
var cufCheck = require('../2016-06-09_user_company_migration/add_company_to_cufs');

function *runCheck () {
  var res = yield addressCheck.checkAll();
  console.log('CHECKING ADDRESS ===>', res);
  res = yield trimCodeCheck.getBadTrimCodes();
  console.log('BAD TRIMCODE ===>', res);
  res = yield speciesCheck.getBadSpecies();
  console.log('BAD SPECIES ===>', res);
  res = yield pmdCheck.getBadPmds();
  console.log('BAD PMD NUMBER ===>', res);
  console.log('CUF without COMPANY ===>');
  cufCheck.cufsWithNoCompany();
}

// baker module
if (require.main === module) {
  var baker = require('dsp_shared/lib/baker');
  util.bakerGen(runCheck, {default:true});
  baker.run();
}