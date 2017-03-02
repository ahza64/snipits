/**
 * @overview This file creates an Admin, Company, and Project
 * @const admin   @see data/login/admin
 * @const company @see data/company/company
 * @const project @see data/projects/project
 * @param {Object} done - marks end of block
 */
const Admin = require('dsp_shared/database/model/ingestion/tables').dispatchr_admins;
const Company = require('dsp_shared/database/model/ingestion/tables').companies;
const Project = require('dsp_shared/database/model/ingestion/tables').work_projects;

const test_configuration = require('../config/ingestion_configuration');
const admin = require('../login/admin');
const company = require('../company/company');
const project = require('../projects/project');

before(function(done) {
  Company.create( company).then(() => {
    Admin.create(admin).then(() => {
      Project.create(project).then(() =>  {
        done();
      });
    });
  });
});

after(function (done) {
  Admin.destroy({where: { email: admin.email }}).then(function() {
    Company.destroy({where: { id: company.id }}).then(function() {
      Project.destroy({where:{id : project.id}}).then(function () {
        done();
      });
    });
  });
});
