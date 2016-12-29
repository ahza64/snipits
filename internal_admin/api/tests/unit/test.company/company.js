const chai = require('chai');
const expect = chai.expect;
const should = chai.should();
const request = require('supertest');
const testConfig = require('../config');
const server = require('../entry');
const admin = require('../data/login/admin');
const _ = require('underscore');
var agent = request(server);
const test_company = require('../data/company/company');
const URL = testConfig.BASE_URL + '/company';
const Admin = require('dsp_shared/database/model/ingestion/tables').dispatchr_admins;

var cookie;

describe('/company tests', function () {
  before(function(done){
      Admin.create(admin).then(() => {
        done();
      });
  });
  after(function(done){
    Admin.destroy({
      where: {
        email: admin.email
      }
    }).then(() => {
      done();
    });
  });

  it('Should log in', done => {
    console.log(testConfig.BASE_URL + '/login');
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

  it('inserts a company', function (done) {
    console.log("creating company with id " + test_company.id);
    agent
    .post(URL)
    .send(test_company)
    .set('Cookie', cookie)
    .end(function (err, res) {
      if(err){
        console.error(err);
      }
      res.body.should.be.true;
      done();
    });
  });

  it('checks that company was actually inserted', function (done) {
    agent
    .get(URL)
    .expect(200)
    .set('Cookie', cookie)
    .end(function (err, res) {
      if(err){
        console.error(err.status);
      }
      var found_company = _.find(res.body, function (company) {
        return company.id === test_company.id
      })
      expect(found_company).to.exist;
      done();
    });
  });

});
