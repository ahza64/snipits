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
require('../helper');
const test_watcher = require('../data/watcher/watcher');
const test_company = require('../data/company/company');
const test_project = require('../data/projects/project');
const URL   = testConfig.BASE_URL + '/ingestions';
const Admin = require('dsp_shared/database/model/ingestion/tables').dispatchr_admins;
const Company = require('dsp_shared/database/model/ingestion/tables').companies;
const Project = require('dsp_shared/database/model/ingestion/tables').projects;
const test_ingestion_file = require ('../data/ingestion/ingestion_file');
var cookie;


describe('Test for "ingestion" ', function () {

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
      console.log("res.body.email ----------->",  res.body.email);
      done();
     });
  });

  it('Should set ingestion notification', function (done) {
    console.log("POSTING to ----------------->", URL);
    agent
    .put(URL)
    .set('Cookie', cookie)
    .set('Content-Type', 'application/json')
    .send(test_ingestion_file)
    .expect(200)
    .end(function (err, res) {
      if (err) {
        console.error(err);
        console.log("DEBUG------------------->", res.body);
      }
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
        //console.log("DEBUG", res);
    });
  });
});
