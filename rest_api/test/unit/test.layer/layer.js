/* globals describe, it, before, after */

/**
 * @fileOverview Unit test for:
 * 1. Login
 * 2. Get all layers
 */

 // Module
 const chai = require('chai');
 const expect = chai.expect;
 const request = require('supertest');
 const testConfig = require('../config');
 const server = require('../entry');
 const _ = require('underscore');
 var agent = request(server);

// Collection
const User = require('dsp_shared/database/model/cufs');
const Tree = require('dsp_shared/database/model/tree');
const Line = require('dsp_shared/database/model/circuit');

// Data
const user = require('../data/user').user;
const oldTree = require('../data/old_tree');
const line = require('../data/lines');

var cookie;

describe('Get Asset Layers', function(){

  before(function(done) {
    console.log('===================== Asset Test start =====================');
    User.create(user)
    .then(function() {
      console.log('user created');
      return Tree.create(oldTree.notComplete);
    })
    .then(function() {
      return Tree.create(oldTree.complete);
    })
    .then(function() {
      return Line.create(line);
    })
    .then(function() {
      console.log('tree created');
      done();
    });
  });

  after(function(done) {
    require('../database/dropDatabase')().then(() => { done(); });
    console.log('===================== Asset Test end =====================');
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

  it('Should get the tower layer', function(done){
    User.findOne({ _id: user._id }, function(err, res){
      expect(err).to.be.equal(null);
      expect(res).to.be.an('object');

      agent
      .get(testConfig.BASE_URL + '/workr/layer/' + 'tower')
      .set('Cookie', cookie)
      .end(function(err, res){
        expect(err).to.be.equal(null);

        //check data
        var data = res.body.data;
        expect(data).to.be.an('object');
        expect(data).to.have.all.keys([
          'lines', 'count', 'tower'
        ]);

        // check lines
        expect(data.lines).to.be.instanceof(Array);

        // check count
        expect(data.count).to.equal(data.tower.length);

        // check tower
        expect(data.tower).to.be.instanceof(Array);
        _.each(data.tower, obj => {
          expect(obj).to.have.all.keys([
            'attributes', 'geometry'
          ]);
        });

        done();
      });
    });
  });

});
