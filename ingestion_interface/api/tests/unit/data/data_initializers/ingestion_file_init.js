
const Users = require('dsp_shared/database/model/ingestion/tables').users;
const Company = require('dsp_shared/database/model/ingestion/tables').companies;
const Project = require('dsp_shared/database/model/ingestion/tables').work_projects;
const Ingestion_Configurations = require('dsp_shared/database/model/ingestion/tables').ingestion_configurations;
const Ingestion_Files = require('dsp_shared/database/model/ingestion/tables').ingestion_files;

const test_configuration = require('../config/config');
const company = require('../company/company');
const project = require('../project/project');
const user = require('../login/user');

before(function(done) {
  Company.create(company).then(() => {
    Users.create(user).then(() => {
      Project.create(project).then(() =>  {
        Ingestion_Configurations.create(test_configuration).then(() => {
          done();
        });
      });
    });
  });
});

after(function (done) {
  Users.destroy({where: { email: user.email }}).then(function() {
    Company.destroy({where: { id: company.id }}).then(function() {
      Project.destroy({where:{id : project.id}}).then(function () {
        Ingestion_Configurations.destroy({where : {id: 33}}).then(() => {
          Ingestion_Files.destroy({where : {s3FileName: "123"}}).then(() => {
            done();
          });
        });
      });
    });
  });
});
