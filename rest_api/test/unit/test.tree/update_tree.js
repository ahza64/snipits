/* globals describe, it, before, after */

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
const user = require('../data/user').user;
const oldTree = require('../data/old_tree');
const newTrimCode = 'NEW_TRIM';

// Jar
var cookie;

// Test Block
describe('Update a tree', function() {

  before(function(done) {
    User.create(user)
    .then(function() {
      console.log('user created');

      Tree.create(oldTree.notComplete)
      .then(function() {
        Tree.create(oldTree.complete)
        .then(function() {
          console.log('tree created');
          done();
        });
      });
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
      var treeId = oldTree.notComplete._id;
      var updatedTree = oldTree.notComplete;
      updatedTree.trim_code = newTrimCode;

      agent
      .patch('/api/test/workorder/' + woId + '/tree/' + treeId)
      .send(updatedTree)
      .set('Cookie', cookie)
      .end(function (err, res) {
        expect(err).to.equal(null);
        expect(res.body.data).to.be.an('object');
        
        Tree.findOne({ _id: updatedTree._id }, function(err, res) {
          expect(err).to.equal(null);
          expect(res).to.be.an('object');
          expect(res.trim_code).to.equal(newTrimCode);
          done();
        });
      });
    });
  });

  it('Should update a complete tree', function(done) {
    User.findOne({ _id: user._id }, function(err, res) {
      expect(err).to.equal(null);
      expect(res).to.be.an('object');

      var woId = res.workorder[0]._id;
      var treeId = oldTree.complete._id;
      var updatedTree = oldTree.complete;
      updatedTree.trim_code = newTrimCode;

      agent
      .patch('/api/test/workorder/' + woId + '/tree/' + treeId)
      .send(updatedTree)
      .set('Cookie', cookie)
      .end(function (err, res) {
        expect(err).to.equal(null);
        expect(res.body).to.be.an('object');
        
        User.findOne({ _id: user._id }, function(err, res) {
          expect(err).to.equal(null);
          expect(res).to.be.an('object');
          expect(res.workorder[0].tasks).to.not.include(updatedTree._id);
          
          Tree.findOne({ _id: updatedTree._id }, function(err, res) {
            expect(err).to.equal(null);
            expect(res).to.be.an('object');
            expect(res.trim_code).to.equal(newTrimCode);
            done();
          });
        });
      });
    });
  });
});