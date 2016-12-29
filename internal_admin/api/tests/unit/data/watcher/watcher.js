//  Must have valid project-id and companyId
const company = require('../company/company');

//TODO fix ingestionConfigurationId
const watcher = {
  companyId : company.id,
  ingestionConfigurationId : 1,
  email: "t@test.com"
};

module.exports = watcher;
