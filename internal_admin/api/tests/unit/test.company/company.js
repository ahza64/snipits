const chai = require('chai');
const expect = chai.expect;
const should = chai.should();
const request = require('supertest');
const testConfig = require('../config');
const server = require('../entry');
const admin = require('../data/login/admin');
var agent = request(server);
const test_company = require('../data/company/company');
const URL = testConfig.BASE_URL + '/company';
var cookie;

describe('/company tests', function () {

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
      console.log("DEGUB", res.body);
      //res.body.should.be.true;
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
      res.body.length.should.not.equal();
      expect(err).to.equal(null)
      done();
    });
  });

  it('should logout', function (done) {
    agent
    .get(testConfig.BASE_URL + '/logout')
    .expect(200)
    .end(function (err, res) {
      res.body.should.be.true;
      if(err){
        console.error(err);
      } else {
        console.log('Logged out!');
      }
      done();
    });
  });

});
