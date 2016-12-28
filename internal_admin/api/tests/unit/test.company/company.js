const chai = require('chai');
const expect = chai.expect;
const should = chai.should();
const request = require('supertest');
const testConfig = require('../config');
const server = require('../entry');
const admin = require('../data/login/admin');
var agent = request(server);

const test_company = require('../data/company/test_company');
const URL = testConfig.BASE_URL + '/company';
var cookie;
describe('Create a copmany', function () {
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
      console.log(res.body);
      done();
    })
  })

  it('inserts a company', function () {
    console.log("creating company with id " + test_company.id);
    agent
    .post(URL)
    .send(test_company)
    .set('Cookie', cookie)
    .end(function (err, res) {
      if(err){
        console.error(err);
      } else {
        console.log('Inserted', res.body);
      }
    })
  })

  it('checks that company was actually inserted', function () {
    agent
    .get(URL)
    .expect(200)
    .set('Cookie', cookie)
    .end(function (err, res) {
      if(err){
        console.error(err.status);
      }
      err.should.not.be.null;
    })
  })

  it('should logout', function (done) {
    agent
    .get(testConfig.BASE_URL + '/logout')
    .expect(200)
    .end(function (err, res) {
      res.body.should.be.true;
      if(err){
        console.error(err.status);
      } else {
        console.log('Logged out!');
      }
      done();
    })
  })

});
