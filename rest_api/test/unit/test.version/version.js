/* globals describe, it, before, after */

/**
 * @fileOverview Unit test for:
 * 1. Tablet version
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
const Client = require('dsp_shared/database/model/client');

// Data
const user = require('../data/user').user;
const version = require('../data/version');

// Jar
var cookie;

// Test Block
describe('Get version', function() {

  before(function(done) {
    console.log('===================== VERSION start =====================');
    User.create(user)
    .then(function() {
      console.log('user created');
      return Client.create(version);
    })
    .then(function() {
      console.log('version created');
      done();
    });
  });

  after(function(done) {
    require('../database/dropDatabase')().then(() => { done(); });
    console.log('===================== VERSION end =====================');
  });

  it('Should log in', function(done) {
    agent
    .post(testConfig.BASE_URL + '/login')
    .send({ email: user.uniq_id, password: user.phone_number })
    .end(function(err, res) {
      expect(err).to.equal(null);
      expect(res.body.data).to.be.an('object');
      expect(res.body.data._id).to.equal(user._id);
      cookie = res.header['set-cookie'].map(function(r) {
        return r.replace('; path=/; httponly', '');
      }).join('; ');
      done();
    });
  });

  it('Should get the version', function(done) {
    var clientName = 'pge';
    agent
    .get(testConfig.BASE_URL + '/client?name=' + clientName)
    .set('Cookie', cookie)
    .end(function(err, res) {
      expect(err).to.equal(null);
      expect(res.body.data).to.be.instanceof(Array);
      expect(res.body.data[0].name).to.equal(clientName);
      done();
    });
  });
});