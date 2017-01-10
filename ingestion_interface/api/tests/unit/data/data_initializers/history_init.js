
const Company = require('dsp_shared/database/model/ingestion/tables').companies;
const Users = require('dsp_shared/database/model/ingestion/tables').users;
const Project = require('dsp_shared/database/model/ingestion/tables').work_projects;
const Ingestion_Configurations = require('dsp_shared/database/model/ingestion/tables').ingestion_configurations;
const Ingestion_Files = require('dsp_shared/database/model/ingestion/tables').ingestion_files;
const Ingestion_Histories = require('dsp_shared/database/model/ingestion/tables').ingestion_histories;

const company = require('../company/company');
const user = require('../login/user');
const project = require('../project/project');
const test_configuration = require('../config/config');
const test_ingest_file = require('../ingestion/ingestion_file');

before(function(done) {
  Company.create(company).then(() => {
    Users.create(user).then(() => {
      Project.create(project).then(() =>  {
        Ingestion_Configurations.create(test_configuration).then(() => {
          Ingestion_Files.create(test_ingest_file).then(() => {
            done();
          });
        });
      });
    });
  });
});

after(function (done) {
  Users.destroy({where: { email: user.email }}).then(function() {
    Company.destroy({where: { id: company.id }}).then(function() {
      Project.destroy({where:{id : project.id}}).then(function () {
        Ingestion_Configurations.destroy({where : {id: test_configuration.id}}).then(() => {
          Ingestion_Files.destroy({where : {s3FileName: test_ingest_file.s3FileName}}).then(() => {
            Ingestion_Histories.destroy({where : {customerFileName: test_ingest_file.customerFileName}}).then(() => {
              done();
            });
          });
        });
      });
    });
  });
});
