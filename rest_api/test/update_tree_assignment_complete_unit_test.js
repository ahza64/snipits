/***/
/**
* @fileoverview tests the assignment_complete field
  of update_tree.js

* @author Hasnain Haider 9/1/16
*/

/**
* Contains sample data a user would use to
  update a tree(s)
* @var {Object} treeData

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
var   user      = require('./resources/user')
var   config    = require('dsp_shared/config/config').get({log4js : false});
var   chai      = require('chai');
var   should    = chai.should();
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
* The (random) workorder of the user that
  that we will be modifying
* @var randomWO

* A random tree to insert
* @var {Object} randomTree1
* Its ID
* @var {String} randomTree1_id


* A random tree to insert
* @var {Object} randomTree2
* Its ID
* @var {String} randomTree2_id

*/

var randomWO;
var randomTree1 = treeData.randomTreeGen();
var randomTree2 = treeData.randomTreeGen();
randomTree2.assignment_complete = true;
var randomTree1_id;
var randomTree2_id;
var workorderId;

describe('======= Api v3 update tree assignment_complete Test ======= ', function () {
/**
* Login using user credentials. get cuf from login

* @param {Function} done
* @return {Void}
*/
  this.timeout(4000);
  it('should login get workorders, trees', function (done) {
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
* @return {Void}
*/
  it('should add tree1 to workorder', function (done) {
    console.log('Adding tree1 to workorder :', workorderId);
    server
    .post('/workorder/' + workorderId + TREE_URL)
    .set('content-type', 'application/json')
    .send(randomTree1)
    .expect(200)
    .end(function (error, response) {
      expect(error).to.be.null;
      var text = JSON.parse(response.text);
      randomTree1_id = text.data._id;
      console.log('tree 1 id ------------------> ', randomTree1_id);
      done();
    });
  });

/**
* Check the package WOs to see if our tree is there
* @return {Void}
*/
  it('should check package WOs for tree1', function (done) {
    console.log('Checking package for new tree...');
    server
    .get(PACK_URL)
    .set('content-type', 'application/json')
    .expect(200)
    .end(function (error, response) {
      expect(error).to.be.null;
      var text = JSON.parse(response.text);
      console.log("text.data.workorders[randomWO].tasks,", " should contain", randomTree1_id);
      text.data.workorders[randomWO].tasks.should.contain(randomTree1_id);
      console.log("checking trees db for " + randomTree1_id);
      Tree.findOne({_id : randomTree1_id}, function (err, res) {
        if (err) {
          console.error(err);
        }
        console.log("found ", res._id);
        res._id.should.not.be.null;
        done();
      })
    });
  });

/**
* Patch the tree1 we just made
*/
  it('should patch dat tree1 assignment_complete', function (done) {
    console.log('editting tree ' + randomTree1_id, 'in workorder ' + workorderId);
    server
    .patch('/workorder/' + workorderId + TREE_URL + '/' + randomTree1_id)
    .set('content-type', 'application/json')
    .send(treeData.completePatch)
    .expect(200)
    .end(function (error, response) {
      expect(error).to.be.null;
      console.log("tree1 set to Completed");
      done();
    });
  });
/**
* Check the package route to see if our tree is there
*/
  it('should check package for successful edit ', function (done) {
    console.log('Checking package for edit..');
    server
    .get(PACK_URL)
    .set('content-type', 'application/json')
    .expect(200)
    .end(function (error, response) {
      expect(error).to.be.null;
      var text = JSON.parse(response.text);
      console.log("Checking workorder " + workorderId + " for Tree " + randomTree1_id);
      console.log(("text.data.workorders[randomWO].tasks", "should NOT contain" , randomTree1_id));
      text.data.workorders[randomWO].tasks.should.not.contain(randomTree1_id);
      done();
    });
  });

  it('should add randomTree2 ', function (done) {
    console.log('adding tree ','in workorder ' + workorderId);
    server
    .post('/workorder/' + workorderId + TREE_URL + '/' )
    .send(randomTree2)
    .expect(200)
    .end(function (error, response) {
      expect(error).to.be.null;
      var text = JSON.parse(response.text);
      randomTree2_id = text.data._id;
      console.log('tree 2 id ------------------> ', randomTree2_id);
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
      console.log('Checking if tree removed from package and workorder : ' + workorderId);

      console.log("packageTreeIds", "should NOT contain" , randomTree2_id);
      packageTreeIds.should.not.contain(randomTree2_id);
      console.log("text.data.workorders[randomWO].tasks", "should NOT contain" , randomTree2_id);
      text.data.workorders[randomWO].tasks.should.not.contain(randomTree2_id);

      console.log("checking trees db for " + randomTree2_id);
      Tree.findOne({_id : randomTree2_id}, function (err, res) {
        if (err) {
          console.error(err);
        }
        console.log("found ", res._id);
        res._id.should.not.be.null;
        done();
      })
    });
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
