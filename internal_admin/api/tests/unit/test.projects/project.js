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

describe('Create a copmany', function () {
  it('Should log in', done => {
    console.log(testConfig.BASE_URL + '/login');
    agent
    .post(testConfig.BASE_URL + '/login')
    .send({email: admin.email, password: '123'})
    .end((err, res) => {
      expect(err).to.equal(null);
      console.log(res.body);
      // expect(res.body.data).to.be.an('object');
      // expect(res.body.data.id).to.equal(admin.id);
      done();
    })
  })

  it('inserts a company', function () {
    console.log("creating company with id " + test_company.id);
    agent
    .post(URL)
    .send(test_company)
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
    .end(function (err, res) {
      if(err){
        console.error(err.status);
      }
      err.should.not.be.null;
      //  res.should.have.status(200);
    })
  })
});
