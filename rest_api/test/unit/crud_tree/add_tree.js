/* globals describe, it, before */

/**
 * @fileOverview Unit test for:
 * 1. Add a new tree
 * 2. Check in the db
 */

// Module
const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const server = require('../entry');
var agent = request(server);

// Collection
const User = require('dsp_shared/database/model/cufs');
const Project = require('dsp_shared/database/model/pmd');

// Data
const user = require('../data/user');
const newTree = require('../data/new_tree');
const project = require('../data/project');

// Global Jar
var cookie;

// Test Block
describe('Add/Update/Delete a tree', function() {

  before(function(done) {
    User.create(user)
    .then(function() {
      console.log('user created');

      Project.create(project)
      .then(function() {
        console.log('project created');
        done();
      });
    });
  });

  it('Should log in', function(done) {
    agent
    .post('/api/test/login')
    .send({ email: user.uniq_id, password: user.phone_number })
    .end(function (err, res) {
      expect(err).to.equal(null);
      expect(res.body.data).to.be.an('object');
      cookie = res.header['set-cookie'].map(function(r) {
        return r.replace('; path=/; httponly', '');
      }).join('; ');
      done();
    });
  });

  it('Should add a new tree', function(done) {
    User.findOne({ _id: user._id }, function(err, res) {
      expect(err).to.equal(null);
      expect(res).to.be.an('object');

      var woId = res.workorder[0]._id;
      agent
      .post('/api/test/workorder/' + woId + '/tree')
      .send(newTree)
      .set('Cookie', cookie)
      .end(function (err, res) {
          expect(err).to.equal(null);
          expect(res.body.data).to.be.an('object');
          
          var newTreeId = res.body.data._id;
          User.findOne({ _id: user._id }, function(err, res) {
            expect(err).to.equal(null);
            expect(res).to.be.an('object');
            expect(res.workorder[0].tasks).to.include(newTreeId);
            done();
          });
        });
      }
    );
  });
});