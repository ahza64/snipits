/**
* @fileoverview tests the GET /workr/package route
*
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
const ASSET_URL = '/asset';
var   chai      = require('chai');
var   should    = chai.should();
var   expect    = chai.expect;
var   request   = require('supertest');
var   server    = request.agent(BASE_URL);
var   config    = require('dsp_shared/config/config').get({log4js : false});
var   user      = require('./resources/user')
require('dsp_shared/database/database')(config.meteor);
var   Cuf       = require('dsp_shared/database/model/cufs');
var   Tree      = require('dsp_shared/database/model/tree');
chai.use(require('chai-http'));

/**
* @global
* The user who is currently logged in
* @var {Object} cuf
*/
var targetTreeId;
var newAssetId;
var newAssetData = require('./resources/sample_asset');

/**
* Test for asset route
*/
describe('Asset Api Test', function () {
/**
* Login using user credentials
* get cuf from login

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
      console.log("searching for user with id :" + text.data._id );

      Cuf.findOne({_id : text.data._id}, function (err, res) {
        expect(err).to.be.null;
        if(err) {
          console.error(err);
        } else {
          console.log("Found ", res.first + ' ' + res.last);
        }
        expect(res.first + res.last).to.equal(user.first+user.last);
        done();
      });
    });
  });

/**
* find a random asset
* @return {Void}
*/
  it('should find a random tree', function (done) {
    server
    .get(PACK_URL)
    .set('content-type', 'application/json')
    .expect(200)
    .end(function (error, response) {
      expect(error).to.be.null;
      var text = JSON.parse(response.text);
      var randomNumber = Math.floor(Math.random() * 1000) % text.data.trees.length;
      //console.log( "num", randomNumber,'LENgth', text.data.trees.length);
      targetTreeId = text.data.trees[randomNumber]._id;
      console.log("random tree to add asset to ---->>>>", targetTreeId);
      newAssetData.ressourceId = targetTreeId;
      done();
    });
  });

  it('should post new asset', function (done) {
    console.log("newAssetData", newAssetData);
    server
    .post(ASSET_URL)
    .set('content-type', 'application/json')
    .send(newAssetData)
    .expect(200)
    .end(function (error, response) {
      expect(error).to.be.null;
      var text = JSON.parse(response.text);
      newAssetId = text._id;
      console.log("added new asset with id: ", newAssetId._id);
      done();
    })
  });

  it('should check asset has been added', function (done) {
    server
    .get(ASSET_URL + '/' + newAssetId)
    .set('content-type', 'application/json')
    .expect(200)
    .end(function (error, response) {
      expect(error).to.be.null;
      expect(response).to.not.be.null;
      done();
    });
  });

/**
* GETs asset as jpg
* @return {Void}
*/
  it('check the targetTree has been updated', function (done) {
    Tree.findOne({_id: targetTreeId}, function (err,res) {
      expect(err).to.be.null;
      console.log("comparing tree image field : ", res.image.toString(), " with the new asset's ID: " , newAssetId);
      expect(res.image.toString()).to.equal(newAssetId);
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
    .expect(200)
    .end(function (error, response) {
      console.log("Attempting logout...");
      expect(error).to.be.null;
      response.should.have.status(200);
    });
  });
});
