/* globals describe, it */

/**
 * @fileoverview tests the assignment_complete field of update_tree.js
 */

/**
 * @var {Object} treeData
 * Contains sample data a user would use to update a tree(s)
 *
 * @var {String} BASE_URL
 * Base URL to the server
 */
const BASE_URL  = process.env.BASE_URL  || 'http://localhost:3000/api/v3';
const LOGIN_URL = '/login';
const LOGOUT_URL= '/logout';
const PACK_URL  = '/workr/package';
const TREE_URL  = '/tree';
var   user      = require('./resources/user');
var   path      = require('path');
var   config    = require('dsp_shared/config/config').get({log4js : false});
var   chai      = require('chai');
var   expect    = chai.expect;
var   request   = require('supertest');
var   _         = require('underscore');
var   server    = request.agent(BASE_URL);
var   treeData= require('./resources/sample_trees');
require('dsp_shared/database/database')(config.meteor);
var   Cuf       = require('dsp_shared/database/model/cufs');
var   Tree      = require('dsp_shared/database/model/tree');
chai.use(require('chai-http'));

/**
 * @var {Number} randomWO
 * The (random) workorder # of the user that we will be modifying
 *
 * @var {String} workorderId
 * Its ID
 *
 * @var {Object} randomTree1
 * A random tree to insert
 *
 * @var {String} randomTree1_id
 * Its ID
 *
 * @var {Object} randomTree2
 * A random tree to insert
 *
 * @var {String} randomTree2_id
 * Its ID
 */
var randomWO;
var randomTree1 = treeData.randomTreeGen();
var randomTree2 = treeData.randomTreeGen();
randomTree2.assignment_complete = true;
var randomTree1_id;
var randomTree2_id;
var workorderId;

describe('===============' + path.basename(__filename) + '=================', function () {
  /**
   * Login using user credentials. get cuf from login
   * 
   * @param {Function} done
   * @return {Void}
   */
  this.timeout(6000);
  it('should login get workorders, trees', function (done) {
    server
    .post(LOGIN_URL)
    .set('content-type', 'application/json')
    .send(user)
    .expect(200)
    .end(function (error, response) {
      expect(error).to.be.null;
      var text = JSON.parse(response.text);
      Cuf.findOne({_id : text.data._id}, function (err, res) {
        expect(err).to.be.null;
        expect(res.workorder).to.not.be.empty;
        var userWorkorderIds = _.pluck(res.workorder, '_id');
        randomWO    = Math.floor(Math.random() * userWorkorderIds.length);
        workorderId = userWorkorderIds[randomWO];
        done();
      });
    });
  });

  /**
   * adds a new tree to the 1st workorder
   * 
   * @return {Void}
   */
  it('should add tree1 to workorder', function (done) {
    server
    .post('/workorder/' + workorderId + TREE_URL)
    .set('content-type', 'application/json')
    .send(randomTree1)
    .expect(200)
    .end(function (error, response) {
      var text = JSON.parse(response.text);
      randomTree1_id = text.data._id;
      done();
    });
  });

  /**
   * Check the package WOs to see if our tree is there
   * 
   * @return {Void}
   */
  it('should check package WOs for tree1', function (done) {
    server
    .get(PACK_URL)
    .set('content-type', 'application/json')
    .expect(200)
    .end(function (error, response) {
      expect(error).to.be.null;
      var text = JSON.parse(response.text);
      expect(text.data.workorders[randomWO].tasks).to.include(randomTree1_id);
      Tree.findOne({_id : randomTree1_id}, function (err, res) {
        expect(err).to.be.null;
        expect(res._id).to.not.be.null;
        done();
      });
    });
  });

  /**
   * Patch the tree1 we just made
   */
  it('should patch dat tree1 assignment_complete', function (done) {
    server
    .patch('/workorder/' + workorderId + TREE_URL + '/' + randomTree1_id)
    .set('content-type', 'application/json')
    .send(treeData.completePatch)
    .expect(200)
    .end(function (error) {
      expect(error).to.be.null;
      done();
    });
  });

  /**
   * Check the package route to see if our tree is there
   */
  it('should check package for successful edit ', function (done) {
    server
    .get(PACK_URL)
    .set('content-type', 'application/json')
    .expect(200)
    .end(function (error, response) {
      expect(error).to.be.null;
      var text = JSON.parse(response.text);
      expect(text.data.workorders[randomWO].tasks).to.not.include(randomTree1_id);
      done();
    });
  });

  it('should add randomTree2 ', function (done) {
    server
    .post('/workorder/' + workorderId + TREE_URL + '/' )
    .send(randomTree2)
    .expect(200)
    .end(function (error, response) {
      expect(error).to.be.null;
      var text = JSON.parse(response.text);
      randomTree2_id = text.data._id;
      done();
    });
  });

  it('should check package for tree 2', function (done) {
    server
    .get(PACK_URL)
    .expect(200)
    .end(function (error, response) {
      expect(error).to.be.null;
      var text = JSON.parse(response.text);
      var packageTreeIds = _.pluck(text.data.trees, '_id');
      expect(packageTreeIds).to.not.include(randomTree2_id);
      expect(text.data.workorders[randomWO].tasks).to.not.include(randomTree2_id);
      Tree.findOne({_id : randomTree2_id}, function (err, res) {
        expect(err).to.be.null;
        expect(res._id).to.not.be.null;
        done();
      });
    });
  });

  /**
   * Logout
   * 
   * @return {Void}
   */
  it('should logout', function () {
    server
    .get(LOGOUT_URL)
    .expect(200)
    .end(function (error) {
      expect(error).to.be.null;
    });
  });

});
