/* globals describe, it, before */

/**
 * @fileOverview Unit test for:
 * 1. Update the trim code of a tree
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
const Tree = require('dsp_shared/database/model/tree');

// Data
const user = require('../data/user');
const oldTree = require('../data/old_tree');

// Global Jar
var cookie;
var newTrimCode = 'NEW_TRIM';

// Test Block
describe('Add/Update/Delete a tree', function() {

  before(function(done) {
    User.create(user)
    .then(function() {
      console.log('user created');

      Tree.create(oldTree)
      .then(function() {
        console.log('tree created');
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

  it('Should update a tree', function(done) {
    User.findOne({ _id: user._id }, function(err, res) {
      expect(err).to.equal(null);
      expect(res).to.be.an('object');

      var woId = res.workorder[0]._id;
      var treeId = oldTree._id;
      var newTree = oldTree;
      newTree.trim_code = newTrimCode;

      agent
      .patch('/api/test/workorder/' + woId + '/tree/' + treeId)
      .send(newTree)
      .set('Cookie', cookie)
      .end(function (err, res) {
        expect(err).to.equal(null);
        expect(res.body.data).to.be.an('object');
        
        Tree.findOne({ _id: newTree._id }, function(err, res) {
          expect(err).to.equal(null);
          expect(res).to.be.an('object');
          expect(res.trim_code).to.equal(newTrimCode);
          done();
        });
      });
    });
  });
});