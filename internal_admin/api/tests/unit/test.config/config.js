const chai = require('chai');
const expect = chai.expect;
const should = chai.should();
const request = require('supertest');
const server = require('../entry');
var agent = request(server);
const testConfig = require('../config');
const test_config = require('../data/config/ingestion_configuration');
const admin = require('../data/login/admin');
const company = require('../data/company/company');
const project = require('../data/projects/project');
const URL = testConfig.BASE_URL + '/config';
const Admin = require('dsp_shared/database/model/ingestion/tables').dispatchr_admins;
const Company = require('dsp_shared/database/model/ingestion/tables').companies;
const Project = require('dsp_shared/database/model/ingestion/tables').work_projects;
require('../data_init');
require('../data_cleanup');

var savedConfigId;

describe('Test for "config ingestion" methods', function () {

  it('logs in admin', done => {
    agent
    .post(testConfig.BASE_URL + '/login')
    .send({email: admin.email, password: '123'})
    .end((err, res) => {
      cookie = res.header['set-cookie'].map(function(r) {
        return r.replace('; path=/; httponly', '');
      }).join('; ');
      expect(err).to.equal(null);
      done();
    });
  });
  it('save configuration', done => {
    agent
    .post(testConfig.BASE_URL + '/config')
    .send(test_config)
    .set('Cookie', cookie)
    .end(function (err, res) {
      if(err){
        console.error('-------------', err);
      }
      res.status.should.not.equal(404);
      res.body.companyId.should.equal(company.id);
      savedConfigId = res.body.id;
      done();
    });
  });
  it('update configuration', done => {
    var new_config = test_config;
    new_config.id = savedConfigId;
    new_config.description = "321";
    agent
    .post(testConfig.BASE_URL + '/config')
    .send(new_config)
    .set('Cookie', cookie)
    .end(function (err, res) {
      if(err){
        console.error('-------------', err);
      }
      res.status.should.not.equal(404);
      res.body.description.should.equal(new_config.description);
      res.body.id.should.equal(savedConfigId);
      done();
    });
  });
  it('should get config', done => {
    agent
    .get(testConfig.BASE_URL + '/configs/' + project.id)
    .set('Cookie', cookie)
    .end(function (err, res) {
      if(err){
        console.error('-------------', err);
      } else {
        res.body[0].description.should.equal("321");
        done();
      }
    });
  });
  it('should delete config', done => {
    agent
    .delete(URL + '/' + savedConfigId)
    .set('Cookie', cookie)
    .expect(200)
    .end(function (err, res) {
      if(err){
        console.error(err);
      } else {
        res.body.should.equal(1);
      }
      done();
    });
  });
});
