/* globals describe, it, before */

/**
 * @fileOverview Unit test for:
 * 1. Add a new tree
 * 2. Update the new tree
 * 3. Delete the new tree
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
    User.create(user, function() {
      console.log('test user created');

      Project.create(project, function() {
        console.log('test project created');
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
    User.findOne({ workorder: { $gt: [] } }, function(err, res) {
      var woId = res.workorder[0]._id;
      agent
      .post('/api/test/workorder/' + woId + '/tree')
      .send(newTree)
      .set('Cookie', cookie)
      .end(function (err, res) {
          expect(err).to.equal(null);
          expect(res.body.data).to.be.an('object');
          done();
        });
      }
    );
  });
});