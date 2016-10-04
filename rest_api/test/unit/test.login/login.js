/* globals describe, it, before, after */

/**
 * @fileOverview Unit test for:
 * Login
 */

// Module
const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const testConfig = require('../config');
const server = require('../entry');
var agent = request(server);

// Collection
const User = require('dsp_shared/database/model/cufs');

// Data
const user = require('../data/user').user;

describe('Login', function() {

  before(function(done) {
    console.log('===================== LOGIN start =====================');
    User.create(user)
    .then(function() {
      console.log('user created');
      done();
    });
  });

  after(function(done) {
    require('../database/dropDatabase')().then(() => {done();});
    console.log('===================== LOGIN end =====================');
  });

  it('Should log in', function(done) {
    agent
    .post(testConfig.BASE_URL + '/login')
    .send({ email: user.uniq_id, password: user.phone_number })
    .end(function (err, res) {
      expect(err).to.equal(null);
      expect(res.body.data).to.be.an('object');
      expect(res.body.data._id).to.equal(user._id);
      done();
    });
  });
});