/***/
/**
* @fileoverview tests the GET /workr/package route

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
var   user      = require('./res/user')
var config      = require('dsp_shared/config/config').get();
var   chai      = require('chai');
var   should    = chai.should();
var   expect    = chai.expect;
var   assert    = chai.assert;
var   request   = require('supertest');
var   _         = require('underscore');
var   server    = request.agent(BASE_URL);
require('dsp_shared/database/database')(config.meteor);
var   Cuf       = require('dsp_shared/database/model/cufs');
var   Tree      = require('dsp_shared/database/model/tree');

chai.use(require('chai-http'));

var randomWO = Math.floor(Math.random() * 100);

function randomTreeGen() {
  var randomLongitude = -47 + Math.random();
  var randomLattitude = -22 + Math.random();
  var height = Math.random() * 100;
  var health = Math.random() * 100;
  var pge_pmd_num = Math.floor(Math.random() * (100000));

  var newTree = {
    "circuit_name": "EcoBoost",
    "pge_pmd_num": pge_pmd_num,
    "location": {
      "type": "Point",
      "coordinates": [
        randomLongitude,
        randomLattitude
      ]
    },
    "height": height,
    "health": health,
    "species": "cow",
    "map_annotations": [],
    "type": "tree",
    "status" : 30000009
  };
  return newTree;
}
var randomTree1 = randomTreeGen();
var randomTree1_id;
var randomTree2 = randomTreeGen();
var randomTree2_id;
randomTree2.assignment_complete = true;

var completePatch = {
  "assignment_complete" : true
};

var workorderId;

var cuf;
var user_credentials = {
  email : "kcmb@pge.com",
  password: "2094951517"
};

describe('Tree Api Test', function () {
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
    .end(function (error, response) {
      expect(error).to.be.null;
      response.should.have.status(200);
      var text = JSON.parse(response.text);
      console.log("searching for user with id : " + text.data._id );

      Cuf.findOne({_id : text.data._id}, function (err, res) {
        expect(err).to.be.null;
        cuf = res;
        if(err) {
          console.error(err);
        } else {
          console.log("Found ", cuf.first + ' ' + cuf.last);
        }
        expect(cuf.workorder).to.not.be.empty;
        var userWorkorderIds = _.pluck(cuf.workorder, '_id');
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
  it('should add tree1 to workorder', function (done) {
    console.log('Adding tree1 to workorder :', workorderId);
    server
    .post('/workorder/' + workorderId + TREE_URL)
    .set('content-type', 'application/json')
    .send(randomTree1)
    .end(function (error, response) {
      response.should.have.status(200);
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
    .end(function (error, response) {
      response.should.have.status(200);
      expect(error).to.be.null;
      var text = JSON.parse(response.text);
      console.log(text.data.workorders[randomWO].tasks, " should contain", randomTree1_id);
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
    .send(completePatch)
    .end(function (error, response) {
      response.should.have.status(200);
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
    .end(function (error, response) {
      response.should.have.status(200);
      expect(error).to.be.null;
      var text = JSON.parse(response.text);
      console.log("Checking workorder " + workorderId + " for Tree " + randomTree1_id);
      console.log((text.data.workorders[randomWO].tasks, "should NOT contain" , randomTree1_id));
      text.data.workorders[randomWO].tasks.should.not.contain(randomTree1_id);
      done();
    });
  });

  it('should add randomTree2 ', function (done) {
    console.log('adding tree ','in workorder ' + workorderId);
    server
    .post('/workorder/' + workorderId + TREE_URL + '/' )
    .send(randomTree2)
    .end(function (error, response) {
      response.should.have.status(200);
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
    .end(function (error, response) {
      response.should.have.status(200);
      expect(error).to.be.null;
      var text = JSON.parse(response.text);
      var packageTreeIds = _.pluck(text.data.trees, '_id');
      console.log('Checking if tree removed from package and WO...');

      console.log(packageTreeIds, "should NOT contain" , randomTree2_id);
      packageTreeIds.should.not.contain(randomTree2_id);
      console.log(text.data.workorders[randomWO].tasks, "should NOT contain" , randomTree2_id);
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
      .end(function (error, response) {
        console.log("Attempting logout...");
        expect(error).to.be.null;
        response.should.have.status(200);
      });
  });

});
