/* globals describe, it, before, after */

/**
 * @fileOverview Unit test for:
 * Login
 */

// Module
const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const server = require('../entry');
var agent = request(server);

// Collection
const User = require('dsp_shared/database/model/cufs');

// Data
const user = require('../data/user').user;

describe('Add a new tree', function() {

  before(function(done) {
    User.create(user)
    .then(function() {
      console.log('user created');
      done();
    });
  });

  after(function(done) {
    require('../database/dropDatabase')();
    done();
  });

  it('Should log in', function(done) {
    agent
    .post('/api/test/login')
    .send({ email: user.uniq_id, password: user.phone_number })
    .end(function (err, res) {
      expect(err).to.equal(null);
      expect(res.body.data).to.be.an('object');
      expect(res.body.data._id).to.equal(user._id);
      done();
    });
  });
});