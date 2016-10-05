/* globals describe, it, before, after */

/**
 * @fileOverview Unit test for:
 * 1. Add a new tree
 * 2. Check in the db
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
const Project = require('dsp_shared/database/model/pmd');
const Tree = require('dsp_shared/database/model/tree');

// Data
const user = require('../data/user').user;
const newTree = require('../data/new_tree');
const project = require('../data/project');

// Jar
var cookie;

// Test Block
describe('Add a new tree', function() {

  before(function(done) {
    console.log('===================== ADD NEW TREE start =====================');
    User.create(user)
    .then(function() {
      console.log('user created');
      return Project.create(project);
    })
    .then(function() {
      console.log('project created');
      done();
    });
  });

  after(function(done) {
    require('../database/dropDatabase')().then(() => { done(); });
    console.log('===================== ADD NEW TREE end =====================');
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

  it('Should add a new tree', function(done) {
    User.findOne({ _id: user._id }, function(err, res) {
      expect(err).to.equal(null);
      expect(res).to.be.an('object');

      var woId = res.workorder[0]._id;
      agent
      .post(testConfig.BASE_URL + '/workorder/' + woId + '/tree')
      .send(newTree.notComplete)
      .set('Cookie', cookie)
      .end(function (err, res) {
        expect(err).to.equal(null);
        expect(res.body.data).to.be.an('object');
        console.log('------------------> ', err);
        console.log('------------------> ', res.body);
        var newTreeId = res.body.data._id;
        User.findOne({ _id: user._id }, function(err, res) {
          expect(err).to.equal(null);
          expect(res).to.be.an('object');
          expect(res.workorder[0].tasks).to.include(newTreeId);

          Tree.findOne({ _id: newTreeId }, function(err, res) {
            expect(err).to.equal(null);
            expect(res).to.be.an('object');
            expect(res._id.toString()).to.equal(newTreeId);
            done();
          });
        });
      });
    });
  });

  it('Should not add a tree at the same location', function(done) {
    User.findOne({ _id: user._id }, function(err, res) {
      expect(err).to.equal(null);
      expect(res).to.be.an('object');

      var woId = res.workorder[0]._id;
      agent
      .post(testConfig.BASE_URL + '/workorder/' + woId + '/tree')
      .send(newTree.notComplete)
      .set('Cookie', cookie)
      .end(function (err, res) {
        expect(err).to.equal(null);
        expect(res.body.envelope).to.be.an('object');
        expect(res.body.envelope.status).to.equal(400);
        done();
      });
    });
  });

  it('Should add a new complete tree', function(done) {
    User.findOne({ _id: user._id }, function(err, res) {
      expect(err).to.equal(null);
      expect(res).to.be.an('object');

      var woId = res.workorder[0]._id;
      agent
      .post(testConfig.BASE_URL + '/workorder/' + woId + '/tree')
      .send(newTree.complete)
      .set('Cookie', cookie)
      .end(function (err, res) {
        expect(err).to.equal(null);
        expect(res.body.data).to.be.an('object');
        
        var newTreeId = res.body.data._id;
        User.findOne({ _id: user._id }, function(err, res) {
          expect(err).to.equal(null);
          expect(res).to.be.an('object');
          expect(res.workorder[0].tasks).to.not.include(newTreeId);
          
          Tree.findOne({ _id: newTreeId }, function(err, res) {
            expect(err).to.equal(null);
            expect(res).to.be.an('object');
            expect(res._id.toString()).to.equal(newTreeId);
            done();
          });
        });
      });
    });
  });
});