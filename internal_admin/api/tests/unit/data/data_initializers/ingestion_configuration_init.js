/**
 * @overview This file creates an Admin, Company, Project, and ingestion_configuration
 * file. For use with @file test.watcher/watcher.js

 * @const admin   @see data/login/admin
 * @const company @see data/company/company
 * @const project @see data/projects/project
 * @const test_configuration @see data/config/ingestion_configuration
 */
const Admin = require('dsp_shared/database/model/ingestion/tables').dispatchr_admins;
const Company = require('dsp_shared/database/model/ingestion/tables').companies;
const Project = require('dsp_shared/database/model/ingestion/tables').work_projects;
const Ingestion_Configurations = require('dsp_shared/database/model/ingestion/tables').ingestion_configurations;

const test_configuration = require('../config/ingestion_configuration')
const admin = require('../login/admin');
const company = require('../company/company');
const project = require('../projects/project');

before(function(done) {
    Company.create(company).then(() => {
      Admin.create(admin).then(() => {
        Project.create(project).then(() =>  {
          Ingestion_Configurations.create(test_configuration).then(() => {
            done();
          });
        });
      });
    });
});
after(function (done) {
  Admin.destroy({where: { email: admin.email }}).then(function() {
    Company.destroy({where: { id: company.id }}).then(function() {
      Project.destroy({where:{id : project.id}}).then(function () {
        Ingestion_Configurations.destroy({where : {createdAt : test_configuration.createdAt}}).then(() => {
          done();
        });
      });
    });
  });
});
