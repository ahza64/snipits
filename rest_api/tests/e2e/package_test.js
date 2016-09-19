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
* URL to mongo database
* @var {String} MONGO_URL
* @const
* @defaultvalue mongodb://localhost:27017/dev_local

* Base URL to the server
* @var {String} BASE_URL
* @const
* @defaultvalue http://localhost:3000/api/v3
*/
const BASE_URL  = process.env.BASE_URL  || 'http://localhost:3000/api/v3';
const PACK_URL  = '/workr/package';
const LOGIN_URL = '/login';
const LOGOUT_URL= '/logout';
var   config    = require('dsp_shared/config/config').get();
var   chai      = require('chai');
var   should    = chai.should();
var   expect    = chai.expect;
var   assert    = chai.assert;
var   request   = require('supertest');
var   _         = require('underscore');
var   server    = request.agent(BASE_URL);
require('dsp_shared/database/database')(config.meteor);
var   Cuf       = require('dsp_shared/database/model/cufs');
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
* @var {Array} userWorkrders

* The user who is currently logged in
* @var {Object} cuf

* User email and password used to
  authenticate user
* @var {Object} user_credentials
*/
var apiTrees;
var apiWorkorders;
var userTrees;
var userWorkrders;
var cuf;
var user_credentials = {
  email : "kcmb@pge.com",
  password: "2094951517"
};
var user= {
  first :'Kerry',
  last : 'Monnie'
};

/**
* Main test for api/v3/workr/package

* gets (1) tree ids (2) workorder ids

* from mongo then the api. Compares mongo and api counterparts

* @param {String} description

* @return {Void}
*/

describe('Package Api Test', function () {
/**
* Login using user credentials
* get cuf from login

* @param {Function} done
* @return {Void}
*/

  it('should login incorrectly ', function () {
    server
    .post(LOGIN_URL)
    .set('content-type', 'application/json')
    .send({email:Math.random(), password: Math.random()})
    .end(function (error, response) {
      response.should.not.have.status(200);
    });
  });

  it('should login and find cuf', function (done) {
    server
    .post(LOGIN_URL)
    .set('content-type', 'application/json')
    .send(user_credentials)
    .end(function (error, response) {
      expect(error).to.be.null;
      response.should.have.status(200);
      var text = JSON.parse(response.text);
      console.log("searching for user with id :" + text.data._id );

      Cuf.findOne({_id : text.data._id}, function (err, res) {
        expect(err).to.be.null;
        cuf = res;
        if(err) {
          console.error(err);
        } else {
          console.log("Found ", cuf.first + ' ' + cuf.last);
        }
        expect(res.first + res.last).to.equal(user.first + user.last);
        done();
      });
    });
  });

/**
* extracting lists from mongo database
* @return {Void}
*/
  it('should extract lists from db', function () {
    userTrees     = _.flatten(_.pluck((cuf.workorder), 'tasks')).sort();
    userWorkrders = _.pluck(cuf.workorder, '_id').sort();
    console.log("retrieved " + userTrees.length + " tree ids from DB");
    console.log("retrieved " + userWorkrders.length + " workorder ids from DB");
    expect(userTrees).to.not.be.empty;
  });

/**
* GETs package route. extracts info.
* @return {Void}
*/
  it('should extract lists from package', function (done) {
    server
    .get(PACK_URL)
    .set('content-type', 'application/json')
    .end(function (error, response) {
      response.should.have.status(200);
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
    // for(var i in apiTrees){
    //   console.log('--->',apiTrees[i], userTrees[i]);
    //   expect(apiTrees[i]).to.equal(userTrees[i]);
    // }
    console.log("Comparing package tree      array against database...");
    expect(apiTrees).to.deep.equal(userTrees);
    console.log("Comparing package workorder array against database...");
    expect(apiWorkorders).to.deep.equal(userWorkrders);
  });

/**
* Logout
* @return {Void}
*/
  it('should logout', function () {
    server
    .get(LOGOUT_URL)
      .end(function (error, response) {
        console.log("Attempting logout...");
        expect(error).to.be.null;
        response.should.have.status(200);
      });
  });
});
