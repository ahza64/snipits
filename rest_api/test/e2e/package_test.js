/**
* @fileoverview tests the GET /workr/package route
* 1 login
* 2 get mongo info
* 3 get api/package info
* 4 compare mongo info w/ api info
* 5 logout
* @author Hasnain Haider 9/1/16
*/

/**
* Base URL to the server
* @var {String} BASE_URL
* @const
* @defaultvalue http://localhost:3000/api/v3
*/
const BASE_URL  = process.env.BASE_URL  || 'http://localhost:3000/api/v3';
const PACK_URL  = '/workr/package';
const LOGIN_URL = '/login';
const LOGOUT_URL= '/logout';
var   config    = require('dsp_shared/config/config').get({log4js : false});
var   chai      = require('chai');
var   should    = chai.should();
var   expect    = chai.expect;
var   request   = require('supertest');
var   _         = require('underscore');
var   server    = request.agent(BASE_URL);
var   user      = require('../resources/user');
require('dsp_shared/database/database')(config.meteor);
var   Cuf       = require('dsp_shared/database/model/cufs');
var   Tree      = require('dsp_shared/database/model/tree');
chai.use(require('chai-http'));

/**
* @global
* Holds list of all trees from all
  workorders returned by the Api
* @var {Array} apiTrees

* Holds list of all trees from all
  workorders found in the db
* @var {Array} userTrees

* Holds list of all workorders
  returned by the Api
* @var {Array} apiWorkorders

* Holds list of all workorders found
  in the db
* @var {Array} userWorkorders

* The user who is currently logged in
* @var {Object} cuf
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

* @param {String} description

* @return {Void}
*/

describe('============ Package Api Test ===========', function () {
/**
* Login using user credentials
* get cuf from login

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
      console.log("searching for user with id :" + text.data._id );

      Cuf.findOne({_id : text.data._id}, function (err, res) {
        expect(err).to.be.null;
        cuf = res;
        if(err) {
          console.error(err);
        } else {
          console.log("Found ", cuf.first + ' ' + cuf.last);
          console.log("Email ", cuf.uniq_id);
        }
        expect(res.first + res.last).to.equal(user.first + user.last);
        last_sent_at = new Date(res.last_sent_at);
        done();
      });
    });
  });

/**
* Extracting lists from mongo database
* @return {Void}
*/
  it('should extract trees, workorders, from db', function () {
    userTrees     = _.flatten(_.pluck((cuf.workorder), 'tasks')).sort();
    userWorkorders = _.pluck(cuf.workorder, '_id').sort();
    console.log("retrieved " + userTrees.length + " tree ids from DB");
    console.log("retrieved " + userWorkorders.length + " workorder ids from DB");
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
        }, function (err,res) {
          if (err) {
            console.error(err);
          }
          var circuits =   _.uniq(_.pluck(res, 'circuit_name'));
          db_circuits.push(circuits);
          if(db_circuits.length === responseWorkorders.length){done();}
        });
      }

    });
  })

/**
* GETs package route. extracts info.
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
      console.log("retrieved " + apiTrees.length + " tree ids from API");
      apiWorkorders = text.data.workorders.map(x => x._id).sort();
      console.log("retrieved " + apiWorkorders.length + " workorders from API");
      done();
    });

  });

/**
* GETs package route. Compare data collected via API
* against the data collected from API
* @return {Void}
*/

  it('should compare package lists with db lists',function () {
    console.log("Comparing package tree      array against database...");
    expect(apiTrees).to.deep.equal(userTrees);
    console.log("Comparing package workorder array against database...");
    expect(apiWorkorders).to.deep.equal(userWorkorders);
  });

  it('should commpare circuit names', function () {
    console.log ("found :" ,db_circuits.length, "circuit_names from db,", package_circuits.length, "circuit_names from package api");
    expect(db_circuits).to.deep.equal(package_circuits);
  })

  it('should verify updated time', function () {
    console.log('User last_sent_at :', last_sent_at.toUTCString(),"\"updated\" field in package :", package_updated.toUTCString() );
    last_sent_at.getTime().should.equal(package_updated.getTime());
  })


/**
* Logout
* @return {Void}
*/
  it('should logout', function () {
    server
    .get(LOGOUT_URL)
    .expect(200)
    .end(function (error, response) {
      console.log("Attempting logout...");
      expect(error).to.be.null;
    });
  });

});
