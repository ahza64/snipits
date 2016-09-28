/* globals afterEach, describe, it */

/**
 * @fileoverview main e2e test
 */

/**
 * Base URL to the server
 * @var {String} BASE_URL
 * @const
 * @defaultvalue http://localhost:3000/api/v3
 */
const BASE_URL = process.env.BASE_URL  || 'http://localhost:3000/api/v3';
const MONGO_URL = 'mongodb://localhost:27017/test_db';
const LOGIN_URL = '/login';
//const LOGOUT_URL = '/logout';
//const PACK_URL = '/workr/package';
//const TREE_URL = '/tree';
const path = require('path');
const fs = require('fs');
const async = require('async');
var _ = require('underscore');
var chai = require('chai');
var expect = chai.expect;
var config = require('dsp_shared/config/config').get({log4js : false});
require('dsp_shared/database/database')(config.meteor);
var request = require('supertest');
var user = require('../resources/user');
var server = request.agent(BASE_URL);
var mongoose = require('mongoose');
mongoose.connect(MONGO_URL);
var Cuf = require('dsp_shared/database/model/cufs');
//var Tree = require('dsp_shared/database/model/tree');
//var workorderId = 'f0edf3c34eb66824dfd7fd46';
var jsFiles = [];

/**
 * @param {String} description of describe test
 * @param {Function} Test the function Holds the main test
 */

afterEach(function () {
  if (this.currentTest.state === 'failed'){
    var date = new Date();
    fs.appendFile(
      '../logs/log.txt',
      date.toUTCString() + ' - ' + this.currentTest.fullTitle() + ' \n ',
      function (err) {
        if (err) {console.error(err);
      }
    });
  }
});

describe('===============' + path.basename(__filename) + '=================', function () {
  /**
   * Login using user credentials
   * 
   * @param {Function} done
   * @return {Void}
   */
  it('shoud load test files', function () {
    //loads tests in .. (rest_api/test)
    var file_list = fs.readdirSync(__dirname + '/..');
    async.forEach(file_list, function (file, callback) {
        if (file.endsWith('.js')) {
          jsFiles.push('../' + file);
        }
        callback();
    }, function (err) {

      expect(err).to.be.null;
      jsFiles  = _.without(
        jsFiles,
        '../trees_test.js',
        '../update_tree_test.js'
      );
    });

    //loads tests in . (rest_api/test/e2e/)
    file_list = fs.readdirSync(__dirname);
    for(var i = 0; i < file_list.length; i++) {
      if(file_list[i].endsWith('.js')) {
        jsFiles.push('./' + file_list[i]);
      }
    }
  });

  it('should login and find the cuf logged in', function (done) {
    console.log(jsFiles);
    server
    .post(LOGIN_URL)
    .set('content-type', 'application/json')
    .send(user)
    .expect(200)
    .end(function (error, response) {
      expect(error).to.be.null;
      var text = JSON.parse(response.text);

      Cuf.findOne({_id : text.data._id}, function (err, res) {
        expect(err).to.be.null;
        expect(res.first + res.last).to.equal(user.first + user.last);
        done();
      });
    });
  });

  it('should run tests', function (done) {
    async.forEach(jsFiles, function (file, callback) {

      describe('running all tests:' + file, function () {
        it('running' + file, function (done) {
          console.log(file);
          require(file);
          done();
        });
        callback();
      });

    }, function (err) {
      expect(err).to.be.null;
      done();
    });
  });
});
