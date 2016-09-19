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
const PACK_URL  = '/workr/package';
const TREE_URL  = '/tree';
var config = require('dsp_shared/config/config').get();
var   chai      = require('chai');
var   should    = chai.should();
var   expect    = chai.expect;
var   request   = require('supertest');
var   _         = require('underscore');
var   server    = request.agent(BASE_URL);
require('dsp_shared/database/database')(config.meteor);
var   Cuf       = require('dsp_shared/database/model/cufs');
chai.use(require('chai-http'));

/**
* @global
* A random Number between 0-10000 that is assigned to the
  tree
* @var {Number} incId

* The new tree object we wish to insert
* @var {Array} newTree

* Properties to edit in the new tree.
* @var {Array} edittedTree

* The id of the workorder of the tree we are manipulating
* @var {String} workorderId

* The id assigned to the tree we insert.
* @var {String} newTreeId

* Array of all of the ids of all the workorders a user has
* @var {Array} userWorkorderIds

* List of all trees' ids in all user workorders
* @var {Array} userTreeIds

* The cuf who's logged in
* @var {Object} cuf

* User email and password used to authenticate
* @var {Object} user_credentials-
*/
var incId = Math.floor(Math.random()*100000);
var randomWO = Math.floor(Math.random()*100);
var newTree = {
  "circuit_name": "EcoBoost",
  "pge_pmd_num": "911",
  "pge_detection_type": "VC1p_AF",
  "location": {
    "type": "Point",
    "coordinates": [
      -121.87237029654763,
      37.585251756643494
    ]
  },
  "division": "Millbrae",
  "project": "transmission_2015",
  "streetName": "Interstate 101",
  "city": "Millbrae",
  "county": "San Mateo",
  "count": 1,
  "dbh": null,
  "height": 29.09000015,
  "health": 100,
  "species": "unknown",
  "map_annotations": [],
  "type": "tree",
  "status" : 99999
};
var edittedTree = {
  "species" : "is editted",
  "inc_id"  : incId
};
var workorderId;
var newTreeId;
var userWorkorderIds;
var userTreeIds;

var cuf;
var user_credentials = {
  email : "kcmb@pge.com",
  password: "2094951517"
};

/**
*route/update_tree.js Test

Route: /api/v3/workorder/:woId/trees/:treeId

* Methods: POST, PATCH, DELETE

* Collection: trees

* @param {String} description

* @return {Void}
*/

describe('Tree Api Test', function () {
/**
* Login using user credentials. get cuf from login

* @param {Function} done
* @return {Void}
*/
  it('should login get workorders, trees', function (done) {
    server
    .post(LOGIN_URL)
    .set('content-type', 'application/json')
    .send(user_credentials)
    .end(function (error, response) {
      expect(error).to.be.null;
      response.should.have.status(200);
      var text = JSON.parse(response.text);
      console.log("searching for user with id : " + text.data._id );

      Cuf.findOne({_id : text.data._id}, function (err, res) {
        expect(err).to.be.null;
        res.should.not.be.null;
        cuf = res;
        if(err) {
          console.error(err);
        } else {
          console.log("Found ", cuf.first + ' ' + cuf.last);
        }
        expect(cuf.workorder).to.not.be.empty;
        userWorkorderIds = _.pluck(cuf.workorder, '_id');
        userTreeIds = _.flatten(_.pluck(cuf.workorder, 'tasks'));
        randomWO   %= userWorkorderIds.length;
        workorderId = userWorkorderIds[randomWO];
        done();
      });
    });
  });

/**
* adds a new tree to the 1st workorder
* @return {Void}
*/
  it('should add a tree to First workorder', function (done) {
    console.log('Adding to workorder :', workorderId);
    server
    .post('/workorder/' + workorderId + TREE_URL)
    .set('content-type', 'application/json')
    .send(newTree)
    .end(function (error, response) {
      response.should.have.status(200);
      expect(error).to.be.null;
      var text = JSON.parse(response.text);
      newTreeId = text.data._id;
      console.log(text.data);
      console.log("new---------->>>>", newTreeId);
      done();
    });
  });

/**
* Check the package route to see if our tree is there
* @return {Void}
*/
  it('should check package for new tree', function (done) {
    console.log('Checking package for new tree...');
    server
    .get(PACK_URL)
    .set('content-type', 'application/json')
    .end(function (error, response) {
      response.should.have.status(200);
      expect(error).to.be.null;
      var text = JSON.parse(response.text);
      text.data.workorders[randomWO].tasks.should.contain(newTreeId);
      done();
    });
  });

/**
* Patch the tree we just made
* @return {Void}
*/
  it('should edit/patch dat tree', function (done) {
    console.log('editting tree ' + newTreeId, 'in workorder ' + workorderId);
    server
    .patch('/workorder/' + workorderId + TREE_URL + '/' + newTreeId)
    .set('content-type', 'application/json')
    .send(edittedTree)
    .end(function (error, response) {
      response.should.have.status(200);
      expect(error).to.be.null;
      done();
    });
  });
/**
* Check the package route to see if our tree is there
* @return {Void}
*/
  it('should check package for successful edit ', function (done) {
    console.log('Checking package for edit..');
    server
    .get(PACK_URL)
    .set('content-type', 'application/json')
    .end(function (error, response) {
      response.should.have.status(200);
      expect(error).to.be.null;
      var text = JSON.parse(response.text);
      var targetTree = _.find(text.data.trees, function (x) {
        return (x._id == newTreeId);
      });
      console.log("Found tree :", targetTree._id);
      for (field in edittedTree) {
        console.log("Checking ", field);
        console.log(edittedTree[field],"===", targetTree[field]);
        expect(edittedTree[field]).to.deep.equal(targetTree[field]);
      }
      done();
    });
  });



  it('should delete dat tree', function (done) {
    console.log('deleting tree ' + newTreeId, 'in workorder ' + workorderId);
    // console.log('/workorder/' + workorderId + '/trees/' + newTreeId);
    server
    .delete('/workorder/' + workorderId + TREE_URL + '/' + newTreeId)
    .send({'status' : '0511231'})
    .end(function (error, response) {
      response.should.have.status(200);
      expect(error).to.be.null;
      done();
    });
  });

  it('should check package for successful delete ', function (done) {
    server
    .get(PACK_URL)
    .end(function (error, response) {
      response.should.have.status(200);
      expect(error).to.be.null;
      var text = JSON.parse(response.text);
      var packageTreeIds = _.pluck(text.data.trees, '_id');
      console.log('Checking if tree deleted from package...');
      packageTreeIds.should.not.contain(newTreeId);
      done();
    });
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
