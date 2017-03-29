
const Admin = require('dsp_shared/database/model/ingestion/tables').dispatchr_admins;
const Company = require('dsp_shared/database/model/ingestion/tables').companies;
const Project = require('dsp_shared/database/model/ingestion/tables').work_projects;
const Ingestion_Configurations = require('dsp_shared/database/model/ingestion/tables').ingestion_configurations;
const Schemas = require('dsp_shared/database/model/ingestion/tables').qow_schemas;
const Taxonomies = require('dsp_shared/database/model/ingestion/tables').qow_taxonomies;

const test_configuration = require('../config/ingestion_configuration')
const admin = require('../login/admin');
const company = require('../company/company');
const project = require('../projects/project');
const schema = require('../schema/schema');
const taxonomy = require('../taxonomy/definition');

before(function(done) {
  Company.create(company).then(() => {
    Admin.create(admin).then(() => {
      Project.create(project).then(() =>  {
        Ingestion_Configurations.create(test_configuration).then(() => {
          Schemas.create(schema).then(() => {
            done();
          })
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
          Schemas.destroy({where: { id: schema.id }}).then(() => {
            Taxonomies.destroy({where: { id: taxonomy.id }}).then(() => {
              done();
            });
          });
        });
      });
    });
  });
});
