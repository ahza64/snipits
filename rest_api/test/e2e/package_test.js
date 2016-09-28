/* globals describe, it */

/**
 * @fileoverview 
 * tests the GET /workr/package route
 * 1 login
 * 2 get mongo info
 * 3 get api/package info
 * 4 compare mongo info w/ api info
 * 5 logout
 */

const BASE_URL  = process.env.BASE_URL  || 'http://localhost:3000/api/v3';
const PACK_URL  = '/workr/package';
const LOGIN_URL = '/login';
const LOGOUT_URL= '/logout';
var   path      = require('path');
var   config    = require('dsp_shared/config/config').get({log4js : false});
var   chai      = require('chai');
var   expect    = chai.expect;
var   request   = require('supertest');
var   _         = require('underscore');
var   server    = request.agent(BASE_URL);
var   user      = require('../resources/user');
require('dsp_shared/database/database')(config.meteor);
var   Cuf       = require('dsp_shared/database/model/cufs');
var   Tree      = require('dsp_shared/database/model/tree');
var exclude_fields = require('../../routes_config').package.exclude;
chai.use(require('chai-http'));

/**
 * @var {Array} apiTrees
 * Holds list of all trees from all
 * workorders returned by the Api
 *
 * @var {Array} userTrees
 * Holds list of all trees from all
 * workorders found in the db
 *
 * @var {Array} apiWorkorders
 * Holds list of all workorders
 * returned by the Api
 *
 * @var {Array} userWorkorders
 * Holds list of all workorders found
 * in the db
 *
 * @var {Object} cuf
 * The user who is currently logged in
 */
var apiTrees;
var apiWorkorders;
var userTrees;
var userWorkorders;
var cuf;
var db_circuits = [];
var package_circuits;
var last_sent_at;
var package_updated;

/**
 * Main test for api/v3/workr/package
 * gets (1) tree ids (2) workorder ids
 * from mongo then the api. Compares mongo and api counterparts
 * 
 * @param {String} description
 * @return {Void}
 */

describe('===============' + path.basename(__filename) + '=================', function () {
  /**
   * Login using user credentials
   * get cuf from login
   *
   * @param {Function} done
   * @return {Void}
   */
  it('should login and find the cuf logged in', function (done) {
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
        cuf = res;
        last_sent_at = new Date(res.last_sent_at);
        done();
      });
    });
  });

  /**
   * Extracting lists from mongo database
   * 
   * @return {Void}
   */
  it('should extract trees, workorders, from db', function () {
    userTrees     = _.flatten(_.pluck((cuf.workorder), 'tasks')).sort();
    userWorkorders = _.pluck(cuf.workorder, '_id').sort();
  });

  it('should extract circuit_names, timestamps from mongo then package API', function (done) {
    this.timeout(5000);
    server
    .get(PACK_URL)
    .set('content-type', 'application/json')
    .expect(200)
    .end(function (error, response) {
      expect(error).to.be.null;
      var text = JSON.parse(response.text);
      var responseWorkorders = text.data.workorders;
      package_updated = new Date(text.data.updated);
      package_circuits = _.pluck(responseWorkorders, 'circuit_names');

      for (var i = 0; i < responseWorkorders.length; i++) {
        var workorder = responseWorkorders[i];
        Tree.find({
          _id: {$in: workorder.tasks}
        }, function (error, response) {
          expect(error).to.be.null;
          var circuits =   _.uniq(_.pluck(response, 'circuit_name'));
          db_circuits.push(circuits);
          if(db_circuits.length === responseWorkorders.length) { done(); }
        });
      }
    });
  });

  /**
   * GETs package route. extracts info.
   *
   * @return {Void}
   */
  it('should extract tree and workorder lists from package', function (done) {
    server
    .get(PACK_URL)
    .set('content-type', 'application/json')
    .expect(200)
    .end(function (error, response) {
      expect(error).to.be.null;
      var text = JSON.parse(response.text);
      apiTrees = text.data.trees.map(x =>x._id).sort();

      //unit test for checking excluded fields in trees
      _.each(text.data.trees, tree => {
        var temp = _.omit(JSON.parse(JSON.stringify(tree)), exclude_fields.tree);
        expect(Object.keys(temp).length).to.equal(Object.keys(tree).length);
      });
      apiWorkorders = text.data.workorders.map(x => x._id).sort();

      //unit test for checking excluded fields in workorders
      _.each(text.data.workorders, wo => {
        var temp = _.omit(JSON.parse(JSON.stringify(wo)), exclude_fields.tree);
        expect(Object.keys(temp).length).to.equal(Object.keys(wo).length);
      });
      done();
    });
  });

  /**
   * GETs package route. Compare data collected via API
   * against the data collected from API
   * 
   * @return {Void}
   */
  it('should compare package lists with db lists',function () {
    expect(apiTrees).to.deep.equal(userTrees);
    expect(apiWorkorders).to.deep.equal(userWorkorders);
  });

  it('should commpare circuit names', function () {
    expect(db_circuits).to.deep.equal(package_circuits);
  });

  it('should verify updated time', function () {
    expect(last_sent_at.toUTCString()).to.equal(package_updated.toUTCString());
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