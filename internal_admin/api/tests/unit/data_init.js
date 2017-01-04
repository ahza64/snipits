const Admin = require('dsp_shared/database/model/ingestion/tables').dispatchr_admins;
const Company = require('dsp_shared/database/model/ingestion/tables').companies;
const Project = require('dsp_shared/database/model/ingestion/tables').work_projects;
//const User = require('.')

const admin = require('./data/login/admin');
const company = require('./data/company/company');
const project = require('./data/projects/project');

before(function(done) {
  console.log('before every test in every file');
  Company.create(company).then(() => {
    Admin.create(admin).then(() => {
      Project.create(project).then(() =>  {
        done();
      })
    });
  });
});
