/**
* @fileoverview Tests routes of update_tree.js
* @author Hasnain Haider
*/

/**
* Base URL to the server
* @var {String} BASE_URL
* @const
* @defaultvalue http://localhost:3000/api/v3

* Contains sample data a user would use to
  update a tree(s)
* @var {Object} treeData
*/
const BASE_URL  = process.env.BASE_URL  || 'http://localhost:3000/api/v3';
const LOGIN_URL = '/login';
const LOGOUT_URL= '/logout';
const PACK_URL  = '/workr/package';
const TREE_URL  = '/tree';
var   async     = require('async');
var   config    = require('dsp_shared/config/config').get({log4js : false});
var   chai      = require('chai');
var   user      = require('./resources/user')
var   should    = chai.should();
var   expect    = chai.expect;
var   assert    = chai.assert;
var   path      = require('path');
var   request   = require('supertest');
var   _         = require('underscore');
var   server    = request.agent(BASE_URL);
var   treeData  = require('./resources/sample_trees');
require('dsp_shared/database/database')(config.meteor);
var   Cuf       = require('dsp_shared/database/model/cufs');
var   Tree      = require('dsp_shared/database/model/tree');
chai.use(require('chai-http'));

/**
* @global
* A random Number to determine workorder the workorder to
  edit
* @var {Number} randomWO

* The id of the workorder of the tree we are manipulating
* @var {String} workorderId

* The id assigned to the tree we insert.
* @var {String} newTreeId

* Array of all of the ids of all the workorders a user has
* @var {Array} userWorkorderIds

* List of all trees' ids in all user workorders
* @var {Array} userTreeIds
*/
var randomWO;
var workorderId;
var newTreeId;
var userWorkorderIds;
var userTreeIds;

var edittedTree = treeData.edittedTree;

/**
*route/update_tree.js Test

Route: /api/v3/workorder/:woId/trees/:treeId

* Methods: POST, PATCH, DELETE

* Collection: trees

* @param {String} description

* @return {Void}
*/

describe('===============' + path.basename(__filename) + '=================', function () {
/**
* Login using user credentials. get cuf from login

* @param {Function} done
* @return {Void}
*/
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
        res.should.not.be.null;
        if(err) {
          console.error(err);
          done(err);
        } else {
          console.log("Found ", res.first + ' ' + res.last);
        }
        expect(res.workorder).to.not.be.empty;
        userWorkorderIds = _.pluck(res.workorder, '_id');
        userTreeIds = _.flatten(_.pluck(res.workorder, 'tasks'));
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
  it('should add a tree to First workorder', function (done) {
    this.timeout(3000);
    console.log('Adding to workorder :', workorderId);
    server
    .post('/workorder/' + workorderId + TREE_URL)
    .set('content-type', 'application/json')
    .send(treeData.newTree)
    .expect(200)
    .end(function (error, response) {
      expect(error).to.be.null;
      var text = JSON.parse(response.text);
      newTreeId = text.data._id;
      console.log("new Tree_id---------->>>>", newTreeId);
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
    .expect(200)
    .end(function (error, response) {
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
  it('should edit/patch dat tree fam', function (done) {
    console.log('editting tree ' + newTreeId, 'in workorder ' + workorderId);
    server
    .patch('/workorder/' + workorderId + TREE_URL + '/' + newTreeId)
    .set('content-type', 'application/json')
    .send(edittedTree)
    .expect(200)
    .end(function (error, response) {
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
    .expect(200)
    .end(function (error, response) {
      expect(error).to.be.null;
      var text = JSON.parse(response.text);
      var targetTree = _.find(text.data.trees, function (x) {
        return (x._id == newTreeId);
      });
      console.log("Found tree :", targetTree._id);
      for (field in edittedTree) {
        console.log("Checking ", field);
        console.log(edittedTree[field], "===" , targetTree[field]);
        expect(edittedTree[field]).to.deep.equal(targetTree[field]);
      }
      done();
    });
  });

  it('should delete dat tree uhearme', function (done) {
    console.log('deleting tree ' + newTreeId, 'in workorder ' + workorderId);
    server
    .delete('/workorder/' + workorderId + TREE_URL + '/' + newTreeId)
    .send(treeData.deletePatch)
    .expect(200)
    .end(function (error, response) {
      expect(error).to.be.null;
      done();
    });
  });

  it('should check package for successful delete edits', function (done) {
    server
    .get(PACK_URL)
    .expect(200)
    .end(function (error, response) {
      expect(error).to.be.null;
      var text = JSON.parse(response.text);
      var packageTreeIds = _.pluck(text.data.trees, '_id');
      var workorderTasks = _.flatten(_.pluck(text.data.workorders,'tasks'));
      console.log('Checking if tree deleted from package...');
      packageTreeIds.should.not.contain(newTreeId);
      workorderTasks.should.not.contain(newTreeId);
      Tree.findOne({_id : newTreeId}, function (err, res) {
        if(err)
          console.error(err);
        async.forEach(_.keys(treeData.deletePatch), function (field, callback) {
          console.log("checking tree for field", field);
          console.log((treeData.deletePatch[field]), (res[field]));
          expect(res[field]).to.equal(treeData.deletePatch[field]);
          callback();
        }, function (err) {
          if (err) {
            console.error(err);
          }
          done();
        });
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
