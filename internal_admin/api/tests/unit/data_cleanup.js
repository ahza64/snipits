const Admin = require('dsp_shared/database/model/ingestion/tables').dispatchr_admins;
const Company = require('dsp_shared/database/model/ingestion/tables').companies;
const Project = require('dsp_shared/database/model/ingestion/tables').work_projects;
//const User = require('.')

const admin = require('./data/login/admin');
const company = require('./data/company/company');
const project = require('./data/projects/project');

after(function (done) {
  Admin.destroy({where: { email: admin.email }}).then(function() {
    Company.destroy({where: { id: company.id }}).then(function() {
      Project.destroy({where:{id : project.id}}).then(function () {
        done();
      })
    });
  });
});
