/* globals describe, it */

/**
 * @fileoverview tests the GET /workr/package route
 */

/**
 * Base URL to the server
 * 
 * @var {String} BASE_URL
 * @const
 * @defaultvalue http://localhost:3000/api/v3
 */
const BASE_URL  = process.env.BASE_URL  || 'http://localhost:3000/api/v3';
const PACK_URL  = '/workr/package';
const LOGIN_URL = '/login';
const LOGOUT_URL= '/logout';
const ASSET_URL = '/asset';
var   chai      = require('chai');
var   path      = require('path');
var   expect    = chai.expect;
var   request   = require('supertest');
var   server    = request.agent(BASE_URL);
var   config    = require('dsp_shared/config/config').get({log4js : false});
var   user      = require('./resources/user');
require('dsp_shared/database/database')(config.meteor);
var   Cuf       = require('dsp_shared/database/model/cufs');
var   Tree      = require('dsp_shared/database/model/tree');
chai.use(require('chai-http'));

/**
 * @var {String} targetTreeId
 * a random tree to add asset(s) to
 *
 * @var {String} newAssetId
 * The ID assigned to the newly posted asset
 *
 * @var {Object} newAssetData
 * The data the new asset will have
 */
var targetTreeId;
var newAssetId;
var newAssetData = require('./resources/sample_asset');

/**
 * Test for asset route
 * 
 * @param {String} description of describe test
 * @param {Function} Test the function Holds the main test
 */
describe('===============' + path.basename(__filename) + '=================', function () {
 /**
  * Login using user credentials
  * 
  * @param {Function} done
  * @return {Void}
  */
  it('should login and find the correct cuf', function (done) {
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
        expect(res.first + res.last).to.equal(user.first+user.last);
        done();
      });
    });
  });

  /**
   * find a random asset
   * 
   * @return {Void}
   */
  it('should find a random tree', function (done) {
    server
    .get(PACK_URL)
    .set('content-type', 'application/json')
    .expect(200)
    .end(function (error, response) {
      expect(error).to.be.null;
      var text = JSON.parse(response.text);
      var randomNumber = Math.floor(Math.random() * 1000) % text.data.trees.length;
      targetTreeId = text.data.trees[randomNumber]._id;
      newAssetData.ressourceId = targetTreeId;
      done();
    });
  });

  /**
   * post a new asset to ASSET_URL
   */
  it('should post new asset', function (done) {
    server
    .post(ASSET_URL)
    .set('content-type', 'application/json')
    .send(newAssetData)
    .expect(200)
    .end(function (error, response) {
      newAssetId = response.body.data._id;
      done();
    });
  });

  it('should check asset has been added', function (done) {
    server
    .get(ASSET_URL + '/' + newAssetId)
    .set('content-type', 'application/json')
    .expect(200)
    .end(function (error, response) {
      expect(error).to.be.null;
      expect(response).to.not.be.null;
      done();
    });
  });

  /**
   * GETs asset as jpg
   * 
   * @return {Void}
   */
  it('check the targetTree has been updated', function (done) {
    Tree.findOne({_id: targetTreeId}, function (err,res) {
      expect(err).to.be.null;
      expect(res.image.toString()).to.equal(newAssetId);
      done();
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
