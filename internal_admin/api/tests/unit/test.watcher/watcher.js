// @TODO Must have valid project-id + ingestionConfigurationId  AND companyId

const chai = require('chai');
const _ = require('underscore');
const expect = chai.expect;
const should = chai.should();
const request = require('supertest');
const testConfig = require('../config');
const server = require('../entry');
const admin = require('../data/login/admin');

var agent = request(server);
const Ingestion_Configurations = require('dsp_shared/database/model/ingestion/tables').ingestion_configurations;
const test_watcher = require('../data/watcher/watcher');
const test_project = require('../data/projects/project');
const test_configuration = require('../data/config/ingestion_configuration')
const URL = testConfig.BASE_URL + '/watcher';
require('../data/data_initializers/ingestion_configuration_init');

var found_watcher;
var cookie;

describe('Test for "watcher" methods', function () {

  it('Should log in', done => {
    Ingestion_Configurations
    .findOne({where : { workProjectId : test_configuration.workProjectId}})
    .then(function (found) {
      test_watcher.ingestionConfigurationId = found.id;
    })
    console.log(testConfig.BASE_URL + '/login');
    agent
    .post(testConfig.BASE_URL + '/login')
    .expect(200)
    .send({email: admin.email, password: '123'})
    .end((err, res) => {
      cookie = res.header['set-cookie'].map(function(r) {
        return r.replace('; path=/; httponly', '');
      }).join('; ');
      expect(err).to.equal(null);
      expect(admin.email).to.equal(res.body.email);
      done();
     });
  });

  it('inserts a watcher', function (done) {
    agent
    .post(URL)
    .send(test_watcher)
    .set('Cookie', cookie)
    .end(function (err, res) {
      if(err){
        console.error(err);
      }
      res.body.email.should.equal(test_watcher.email)
      res.status.should.not.equal(404);
      done();
    });
  });

  it('should get watcher with the configuration id', function (done) {
    agent
    .get(URL + '/' + test_watcher.ingestionConfigurationId)
    .set('Cookie', cookie)
    .expect(200)
    .end(function (err, res) {
      if(err){
        console.error(err);
      }
      found_watcher = _.find(res.body, function (item) {
        return item.email === test_watcher.email;
      });
      console.log("Searching for watcher by email...");
      console.log(found_watcher.email, "ID: " + found_watcher.id);
      expect(found_watcher).to.exist;
      done();
    });
  });

//successful delete results in 1
  it('Should delete the watcher', function (done) {
    agent
    .delete(URL + '/' + found_watcher.id)
    .set('Cookie', cookie)
    .expect(200)
    .end(function (err, res) {
      if(err){
        console.error(err);
      }
      res.body.should.equal(1);
      done();
    });
  });
});
