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
const LOGIN_URL = '/login';
const LOGOUT_URL= '/logout';
const RES_URL   = '/tree';
var   path      = require('path');
var   chai      = require('chai');
var   should    = chai.should();
var   expect    = chai.expect;
var   assert    = chai.assert;
var   user      = require('./resources/user');
var   config    = require('dsp_shared/config/config').get({log4js : false});
require('dsp_shared/database/database')(config.meteor);
var   request   = require('supertest');
var   server    = request.agent(BASE_URL);
var   treeData= request('./resources/sample_trees');
var   Cuf       = require('dsp_shared/database/model/cufs');
var   Tree      = require('dsp_shared/database/model/tree');
chai.use(require('chai-http'));

/**
* @global

* The information we wish to update on
  the tree
  @var {Object} edittedData

* Properties for the new tree
* @var {Object} postData

* Query to submit on GET /trees
* @var {String} treeQuery

* User email and password used to
  authenticate user
* @var {Object} user_credentials
*/
var offset =  0; // Math.floor(Math.random() * 10) + 1;
var randLength = Math.floor(Math.random() * 10) + 1;

var treeQuery = '?' +'length=' + randLength + '&offset=' + offset;
var newTreeId;
var edittedData = treeData.edittedData;
var postData = treeData.postData;

/**
* Main test for api/v3/workr/package

* gets (1) tree ids (2) workorder ids

* from mongo then the api. Compares mongo and api counterparts

* @param {String} description

* @return {Void}
*/

describe('===============' + path.basename(__filename) + '=================', function () {
/**
* Login using user credentials
* get cuf from login

* @param {Function} done
* @return {Void}
*/
  it('should login', function (done) {
    server
    .post(LOGIN_URL)
    .set('content-type', 'application/json')
    .send(user)
    .expect(200)
    .end(function (error, response) {
      expect(error).to.be.null;
      var text = JSON.parse(response.text);
      console.log("searching for user with id : " + text.data._id );

      Cuf.findOne({_id : text.data._id}, function (err, res) {
        expect(err).to.be.null;
        if(err) {
          console.error(err);
        } else {
          console.log("Found ", res.first + ' ' + res.last);
        }
        done();
      });
    });
  });

/**Tree
Route: /api/v3/tree
Methods: GET, POST, PUT
Collection: trees

Add
edit
delete

First try GET
*/

/**
* extracting lists from mongo database
* @return {Void}
*/

  it('make query to resource route', function (done) {
    console.log('Checking ' + RES_URL + treeQuery);
    server
    .get(RES_URL + treeQuery)
    .set('content-type', 'application/json')
    .expect(200)
    .end(function (error, response) {
      expect(error).to.be.null;
      var text = JSON.parse(response.text);
      var apiTrees = text.data.map(x => x._id);
      assert.lengthOf(apiTrees, randLength, 'There should be ' + randLength + ' results');
      done();
    });
  });


/**
* GETs package route. Compare data collected via API
* against the data collected from API
* @return {Void}
*/
  it('should add a new tree',function (done) {
    server
    .post(RES_URL)
    .set('content-type', 'application/json')
    .send(postData)
    .expect(201)
    .end(function (err, res) {
      expect(err).to.be.null;
      var text = JSON.parse(res.text);

      newTreeId = text.data._id
      done();
    })
  });

/**
* check resource url for new tree
* @return {Void}
*/

  it('should check the newly created tree',function (done) {
    server
    .get(RES_URL + '/' + newTreeId)
    .set('content-type', 'application/json')
    .expect(200)
    .end(function (err, res) {
      expect(err).to.be.null;
      Tree.findOne({_id : newTreeId}, function (err,res) {
        expect(err).to.be.null;
        console.log('Checking new tree has correct properties... ');
        console.log('ID', newTreeId);
        for(field in postData)
        {
          console.log('field :', field);
          console.log(postData[field], ' is equal to ', res[field]);
          expect(postData[field]).to.equal(res[field]);
        }
        done();
      });

    })
  });
/**
* GETs resource route.
* @return {Void}
*/

  it('should patch and update a resource', function (done) {
    server
    .patch(RES_URL + '/' + newTreeId)
    .set('content-type', 'application/json')
    .send(edittedData)
    .expect(200)
    .end(function (err, res) {
      expect(err).to.be.null;
      expect(res).to.not.be.null;
      done();
    });
  });

//id remains the same
  it('should check the updated resource',function (done) {
    server
    .get(RES_URL + '/' + newTreeId)
    .set('content-type', 'application/json')
    .expect(200)
    .end(function (err, res) {
      expect(err).to.be.null;
      var tree = Tree.findOne({_id : newTreeId}, function (err,res) {
        expect(err).to.be.null;
        console.log('Checking editted resource has correct properties... ');
        console.log('ID: ', newTreeId);
        for(field in edittedData)
        {
          console.log("field", field);
          console.log(edittedData[field], ' is equal to ', res[field]);
          expect(edittedData[field]).to.equal(res[field]);
        }
        done();
      });

    })
  });

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
