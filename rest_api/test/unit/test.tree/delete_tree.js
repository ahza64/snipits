/* globals describe, it, before, after */

/**
 * @fileOverview Unit test for:
 * 1. Delete a tree
 * 2. Check cufs collection in the db
 * 3. Check trees collection in the db
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
const Tree = require('dsp_shared/database/model/tree');

// Data
const user = require('../data/user').user;
const oldTree = require('../data/old_tree').complete;

// Jar
var cookie;

// Test Block
describe('Delete a tree', function() {

  before(function(done) {
    console.log('===================== DELETE TREE start =====================');
    User.create(user)
    .then(function() {
      console.log('user created');
      return Tree.create(oldTree);
    })
    .then(function() {
      console.log('tree created');
      done();
    });
  });

  after(function(done) {
    require('../database/dropDatabase')().then(() => { done(); });
    console.log('===================== DELETE TREE end =====================');
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

  it('Should delete a tree', function(done) {
    User.findOne({ _id: user._id }, function(err, res) {
      expect(err).to.equal(null);
      expect(res).to.be.an('object');

      var woId = res.workorder[0]._id;
      var treeId = oldTree._id;
      var deletedTree = oldTree;
      var deletedStatus = '6' + deletedTree.status.slice(1);

      agent
      .del(testConfig.BASE_URL + '/workorder/' + woId + '/tree/' + treeId)
      .send(deletedTree)
      .set('Cookie', cookie)
      .end(function (err, res) {
        expect(err).to.equal(null);
        expect(res.body.data).to.be.an('object');
        
        Tree.findOne({ _id: deletedTree._id }, function(err, res) {
          expect(err).to.equal(null);
          expect(res).to.be.an('object');
          expect(res.status).to.equal(deletedStatus);
          
          User.findOne({ _id: user._id }, function(err, res) {
            expect(err).to.equal(null);
            expect(res).to.be.an('object');
            expect(res.workorder[0].tasks).to.not.include(deletedTree._id);
            done();
          });
        });
      });
    });
  });
});