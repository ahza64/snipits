
const chai = require('chai');
const expect = chai.expect;
const should = chai.should();
const request = require('supertest');
const testConfig = require('../config');
const server = require('../entry');
const admin = require('../data/login/admin');
var agent = request(server);

describe('Just Login 123 123', function () {
  it('Should log in', done => {
    console.log(testConfig.BASE_URL + '/login');
    agent
    .post(testConfig.BASE_URL + '/login')
    .send({ email: admin.email, password: '123'})
    .end((err, res) => {
      expect(err).to.equal(null);
      console.log(res.body);
      // expect(res.body.data).to.be.an('object');
      // expect(res.body.data.id).to.equal(admin.id);
      done();
    })
  })
})
