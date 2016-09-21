/**
* @fileoverview main e2e test
* @author Hasnain Haider
*/

/**
* Base URL to the server
* @var {String} BASE_URL
* @const
* @defaultvalue http://localhost:3000/api/v3
*/
const BASE_URL  = process.env.BASE_URL  || 'http://localhost:3000/api/v3';
const MONGO_URL ="mongodb://localhost:27017/test_db"
const LOGIN_URL = '/login';
const LOGOUT_URL= '/logout';
const PACK_URL  = '/workr/package';
const TREE_URL  = '/tree';

var   chai      = require('chai');
var   should    = chai.should();
var   expect    = chai.expect;
// var   treeData  = require('./resources/sample_trees');
var   config    = require('dsp_shared/config/config').get({log4js : false});
require('dsp_shared/database/database')(config.meteor);
var   request   = require('supertest');
var   user      = require('./resources/user');
var   server    = request.agent(BASE_URL);
var   mongoose  = require('mongoose');
mongoose.connect(MONGO_URL);
var   Cuf       = require('dsp_shared/database/model/cufs');
var   Tree      = require('dsp_shared/database/model/tree');
var   workorderId = "f0edf3c34eb66824dfd7fd46";
var   sample_asset = require('./resources/sample_asset');

/**
* @param {String} description of describe test
* @param {Function} Test the function Holds the main test
*/
describe('=============== e2e Test Part 1 =================', function () {
/**
* Login using user credentials
* get cuf from login
  Ifoundthebug
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
        if(err) {
          console.error(err);
        } else {
          console.log("Found ", res.first + ' ' + res.last);
          console.log("Email ", res.uniq_id);
        }
        expect(res.first + res.last).to.equal(user.first + user.last);
        done();
      });
    });
  });

  // it('should post a new tree ',function (done) {
  //   this.timeout(4000);
  //   console.log('Adding to workorder :', workorderId, "the following tree", treeData.newTree.circuit_name );
  //   server
  //   .post('/workorder/' + workorderId + TREE_URL)
  //   .set('content-type', 'application/json')
  //   .send(treeData.newTree)
  //   .expect(200)
  //   .end(function (error, response) {
  //     expect(error).to.be.null;
  //     var text = JSON.parse(response.text);
  //     console.log("text : ", text);
  //     console.error("Error :",error);
  //     newTreeId = text.data._id;
  //     console.log("new Tree _id ---------->>>>", newTreeId);
  //     //sample_asset.ressourceId = newTreeId;
  //
  //     done();
  //   });
  // })
  it('should run asset_test1+2', function () {
    require('./asset_test1');
    require('./asset_test2');
  });
});
