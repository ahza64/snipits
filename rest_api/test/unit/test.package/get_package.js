/* globals describe, it, before, after */

/**
 * @fileOverview Unit test for:
 * 1. Login
 * 2. Get the package
 * 3. Check the workorder
 * 4. Check empty workorder should get filtered
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

// Jar
var cookie;

// Test Block
describe('Get package', function() {

  before(function(done) {
    console.log('===================== PACKAGE start =====================');
    User.create(user)
    .then(function() {
      console.log('user created');
      done();
    });
  });

  after(function(done) {
    require('../database/dropDatabase')().then(() => { done(); });
    console.log('===================== PACKAGE end =====================');
  });

  it('Should log in', function(done) {
    agent
    .post(testConfig.BASE_URL + '/login')
    .send({ email: user.uniq_id, password: user.phone_number })
    .end(function (err, res) {
      expect(err).to.equal(null);
      expect(res.body.data).to.be.an('object');
      expect(res.body.data._id).to.equal(user._id);
      cookie = res.header['set-cookie'].map(function(r) {
        return r.replace('; path=/; httponly', '');
      }).join('; ');
      done();
    });
  });

  it('Should get the package, and filter the empty workorders', function(done) {
    User.findOne({ _id: user._id }, function(err, res) {
      expect(err).to.equal(null);
      expect(res).to.be.an('object');

      agent
      .get(testConfig.BASE_URL + '/workr/package')
      .set('Cookie', cookie)
      .end(function (err, res) {
        expect(err).to.equal(null);
        
        // Check package
        var dataPackage = res.body.data;
        expect(dataPackage).to.be.an('object');
        expect(dataPackage).to.have.all.keys([
          'updated', 'user', 'workorders', 'trees', 'map_features'
        ]);

        // Check user
        expect(dataPackage.user).to.be.an('object');
        expect(dataPackage.user).to.have.all.keys([
          '_id', 'first', 'last'
        ]);
        expect(dataPackage.user._id).to.equal(user._id);

        // Check workorder
        expect(dataPackage.workorders).to.be.instanceof(Array);
        expect(dataPackage.workorders[0]).to.have.all.keys([
          'tasks', 'name', 'work_type', 'priority', 'status', 
          'circuit_names', 'location', 'span_name', '_id'
        ]);

        // Check if filter empty workorder
        var emptyWoIds = user.workorder.filter(wo => wo.tasks.length === 0).map(wo => wo._id);
        var packageWoIds = dataPackage.workorders.map(wo => wo._id);
        emptyWoIds.forEach(id => {
          expect(packageWoIds).to.not.include(id);
        });

        done();
      });
    });
  });
});