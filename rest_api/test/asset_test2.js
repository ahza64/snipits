/* globals describe, it */

/**
 * @fileoverview tests the asset
 * Login
 * Add new tree.
 * Check if new tree was added successfully.
 * POST 3 assets with different asset_types. [image, tc_image, ntw_image].
 * Check if all 3 fields in the tree is updated with the respective asset ID's.
 * Logout
 */

const BASE_URL  = process.env.BASE_URL  || 'http://localhost:3000/api/v3';
const PACK_URL  = '/workr/package';
const LOGIN_URL = '/login';
const LOGOUT_URL= '/logout';
const ASSET_URL = '/asset';
const TREE_URL  = '/tree';
var   path      = require('path');
var   async     = require('async');
var   chai      = require('chai');
var   expect    = chai.expect;
var   request   = require('supertest');
var   server    = request.agent(BASE_URL);
var   config    = require('dsp_shared/config/config').get({log4js : false});
var   treeData  = require('./resources/sample_trees');
var   user      = require('./resources/user');
require('dsp_shared/database/database')(config.meteor);
var   Cuf       = require('dsp_shared/database/model/cufs');
var   Tree      = require('dsp_shared/database/model/tree');
var   sample_asset = require('./resources/sample_asset');
var   asset_types  = ['image', 'tc_image', 'ntw_image'];
chai.use(require('chai-http'));

/**
 * @var {String} workorderId
 * The ID of the workorder to be editted
 *
 * @var {Array} asset_types
 * All the types of assets
 *
 * @var {Object} asset_typeIds 
 * The object that will store the IDs of
 * the newly posted assets
 *
 * @var {String} newTreeId
 * The id assigned to the tree we insert.
 */
var workorderId;
var asset_typeIds = {};
var newTreeId;

/**
 * Test for asset route part 2
 */
describe('===============' + path.basename(__filename) + '=================', function () {
  /**
   * Login using user credentials
   * get cuf from login
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
        expect(res.first + res.last).to.equal(user.first + user.last);
        done();
      });
    });
  });

  /**
   * fetch a random workorder to add to
   * 
   * @param {Function} done
   * @return {Void}
   */
  it('should find a random workorder to edit', function (done) {
    server
    .get(PACK_URL)
    .set('content-type', 'application/json')
    .expect(200)
    .end(function (error, response) {
      expect(error).to.be.null;
      var text = JSON.parse(response.text);
      var workorders = text.data.workorders;
      var randomWorkorder = Math.floor(Math.random() * workorders.length);
      var workorder = workorders[randomWorkorder];
      workorderId = workorder._id;
      done();
    });
  });

  /**
   * Add tree to a workorder
   * 
   * @param {Function} done
   * @return {Void}
   */
  it('should add a tree to random workorder', function (done) {
    this.timeout(4000);
    var newTree = new treeData.randomTreeGen();
    server
    .post('/workorder/' + workorderId + TREE_URL)
    .set('content-type', 'application/json')
    .send(newTree)
    .expect(200)
    .end(function (error, response) {
      newTreeId = response.body.data._id;
      sample_asset.ressourceId = newTreeId;
      done();
    });
  });

  /**
   * find a random asset
   * 
   * @return {Void}
   */
  it('should add all types of assets', function (done) {
    async.forEach(asset_types, function (asset_type, callback) {
      sample_asset.meta.imageType = asset_type;
      server
      .post(ASSET_URL)
      .send(sample_asset)
      .expect(200)
      .end(function (error, response) {
        var text = JSON.parse(response.text);
        asset_typeIds[asset_type] = text.data._id;
        Tree.findOne({_id : newTreeId},function (err, res) {
          expect(err).to.equal.null;
          expect(asset_typeIds[asset_type]).to.equal(res[asset_type].toString());
        });
        callback();
      });
    },
    function (err) {
      if (err) {
        console.error(err);
      }
    });
    done();
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
