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
var   assert    = chai.assert;
var   request   = require('supertest');
var   _         = require('underscore');
var   server    = request.agent(BASE_URL);
var   config    = require('dsp_shared/conf.d/config');
require('dsp_shared/database/database')(config.meteor);
var   Cuf       = require('dsp_shared/database/model/cufs');
var   Asset     = require('dsp_shared/database/model/assets');
chai.use(require('chai-http'));

/**
* @global
* The user who is currently logged in
* @var {Object} cuf

* User email and password used to
  authenticate user
* @var {Object} user_credentials
*/

var randomAssetId;
var newAssetId;
var newAssetData = require('./res/sample_img');
var cuf;
var user_credentials = {
  email : "kcmb@pge.com",
  password: "2094951517"
};
const MIN_FILE_SIZE = 3000;

/**
* Main test for asset
GET /asset/:id.jpg
GET /asset/:id.jpeg
GET /asset/:id

POST /asset

*/

describe('Asset Api Test', function () {
/**
* Login using user credentials
* get cuf from login

* @param {Function} done
* @return {Void}
*/
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
        done();
      });
    });
  });

/**
* find a random asset
* @return {Void}
*/
  it('find an asset', function (done) {
    Asset.findOne({},function (err,res) {
      if(err) {
        console.error(err);
      } else {
        console.log("Found asset : ",  res._id);
      }
      expect(err).to.be.null;
      randomAssetId = res._id;
      done();
    });
  });

/**
* GETs asset as jpg
* @return {Void}
*/
  it('get the jpgs', function (done) {
    server
    .get(ASSET_URL + '/' + randomAssetId + '.jpg')
    .set('content-type', 'application/json')
    .end(function (error, response) {
      if (error) {
        console.error(error);
      }
      response.should.have.status(200);
      expect(error).to.be.null;

      expect(response.body).to.have.length.of.at.least(MIN_FILE_SIZE);
      console.log("Body length of response jpg :", response.body.length);
      done();
    });
  });

  /**
  * GETs asset as jpeg
  * @return {Void}
  */
  it('get the jpegs', function (done) {
    server
    .get(ASSET_URL + '/' + randomAssetId + '.jpeg')
    .set('content-type', 'application/json')
    .end(function (error, response) {
      if (error) {
        console.error(error);
      }
      response.should.have.status(200);
      expect(error).to.be.null;

      expect(response.body).to.have.length.of.at.least(MIN_FILE_SIZE);
      console.log("Body length of response jpeg:", response.body.length);
      done();
    });
  });

/**
* GETs the asset in binary
* @return {Void}
*/
  it('should get the binary', function (done) {
    server
    .get(ASSET_URL + '/' + randomAssetId)
    .set('content-type', 'application/json')
    .end(function (error, response) {
      if (error) {
        console.error(error);
      }
      response.should.have.status(200);
      expect(error).to.be.null;

      expect(response.body).to.have.length.of.at.least(MIN_FILE_SIZE);
      console.log("Body length of response binary:", response.body.length);
      done();
    });
  });

/**
* POSTs asset route.
* @return {Void}
*/
  it('Create an asset', function (done) {
    server
    .post(ASSET_URL)
    .set('content-type', 'application/json')
    .send(newAssetData)
    .end(function (error, response) {
      if (error) {
        console.error(error);
      }
      response.should.have.status(200);
      expect(error).to.be.null;
      console.log(response.body);
      newAssetId = response.body._id;//.ntw_image._id || response.body.image._id || response.body.tc_image._id;
      console.log('Asset Id :', newAssetId);
      done();
    });
  });

  /**
  * Check the asset was created.
  * @return {Void}
  */
    it('Check asset was created', function (done) {
      server
      .get(ASSET_URL + '/' + newAssetId)
      .set('content-type', 'application/json')
      .end(function (error, response) {
        if (error) {
          console.error(error);
        }
        response.should.have.status(200);
        expect(error).to.be.null;
        expect(response.body).to.have.length.of.at.least(MIN_FILE_SIZE);
        console.log("found :", response.body);
        done();
      });
    });
/**

*/
  // it('should compare package lists with db lists',function () {
  //   console.log("C\nC");
  // });

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
