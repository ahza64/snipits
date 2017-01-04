// @TODO Must have valid+ ingestion file ID + ingestionConfig ID + Company ID

const chai = require('chai');
const _ = require('underscore');
const expect = chai.expect;
const should = chai.should();
const request = require('supertest');
const testConfig = require('../config');
const server = require('../entry');
const admin = require('../data/login/admin');
var agent = request(server);
require('../data_init');
require('../data_cleanup');
const test_watcher = require('../data/watcher/watcher');
const test_company = require('../data/company/company');
const test_project = require('../data/projects/project');
const URL   = testConfig.BASE_URL + '/ingestions';
const Ingestion_Configurations = require('dsp_shared/database/model/ingestion/tables').ingestion_configurations;
const Admin = require('dsp_shared/database/model/ingestion/tables').dispatchr_admins;
const Company = require('dsp_shared/database/model/ingestion/tables').companies;
const Project = require('dsp_shared/database/model/ingestion/tables').projects;
const test_ingestion_file = require ('../data/ingestion/ingestion_file');
var cookie;


describe('Test for "ingestion" ', function () {
//@TODO add before insert ingestion_configuration


  it('Should log in', done => {
    agent
    .post(testConfig.BASE_URL + '/login')
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

  it('Should set ingestion notification', function (done) {
    agent
    .put(URL)
    .set('Cookie', cookie)
    .set('Content-Type', 'application/json')
    .send(test_ingestion_file)
    .expect(200)
    .end(function (err, res) {
      if (err) {
        console.error(err);
      }
      //ADD assertion
      done();
    });
  });

  it('Should check GET and check for insertion',function (done) {
    agent
    .get(URL + '/' + test_ingestion_file.id)
    .set('Cookie', cookie)
    .expect(200)
    .end(function (err,res) {
        if(err){
          console.error(err);
        }
        done();
        //add assertion
    });
  });
});
