/**
* @overview this is the sample watcher for db insertion
* @TODO ingestionConfigurationId needs to be fixed, should not be const
*/

//  Must have valid project-id and companyId
const company = require('../company/company');

const watcher = {
  companyId : company.id,
  ingestionConfigurationId : 1,
  email: "t@test.com"
};

module.exports = watcher;
