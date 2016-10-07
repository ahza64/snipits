/* globals describe, it, before, after */

/**
 * @fileOverview Unit test for:
 * 1. Delete a tree
 * 2. Check cufs collection in the db
 * 3. Check trees collection in the db
 * 4. Check the assets collection in the db
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
const Asset = require('dsp_shared/database/model/assets');

// Data
const user = require('../data/user').user;
const oldTree = require('../data/old_tree').notComplete;
const asset = require('../data/asset');

// Jar
var cookie;
var assetId;

// Test Block
describe('Post/Get an asset', function() {

  before(function(done) {
    console.log('===================== ASSET start =====================');
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
    require('../database/dropDatabase')().then(() => {done();});
    console.log('===================== ASSET end =====================');
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

  it('Should save a tree asset', function(done) {
    agent
    .post(testConfig.BASE_URL + '/asset')
    .send(asset)
    .set('Cookie', cookie)
    .end(function(err, res) {
      expect(err).to.equal(null);
      expect(res.body.data).to.be.an('object');
      assetId = res.body.data._id;
      expect(assetId).to.be.a('string');
      Asset.findOne({_id: assetId}, function(err, res){
        expect(err).to.equal(null);
        expect(res).to.be.an('object');
        expect(res._id.toString()).to.equal(assetId);
        done();
      });
    });
  });

  it('Should get a tree asset with jpeg format', function(done) {
    agent
    .get(testConfig.BASE_URL + '/asset/' + assetId + '.jpeg')
    .set('Cookie', cookie)
    .end(function(err, res) {
      expect(err).to.equal(null);
      expect(res.body).to.not.equal(null);
      Asset.findOne({ _id: assetId }, function(err, res) {
        expect(err).to.equal(null);
        expect(res).to.be.an('object');
        done();
      });
    });
  });
});
