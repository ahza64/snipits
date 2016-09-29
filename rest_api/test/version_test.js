/* globals describe, it */

/**
 * @fileoverview tests the GET /route/version.js
 */

const BASE_URL  = process.env.BASE_URL  || 'http://localhost:3000/api/v3';
const LOGIN_URL = '/login';
const CLIENT_URL= '/client';
var   path      = require('path');
var   config    = require('dsp_shared/config/config').get({log4js : false});
var   chai      = require('chai');
var   expect    = chai.expect;
var   user      = require('./resources/user');
var   request   = require('supertest');
var   _         = require('underscore');
var   server    = request.agent(BASE_URL);
var   mongo_clients = require('./resources/version_mongo_clients');
require('dsp_shared/database/database')(config.meteor);
chai.use(require('chai-http'));

/**
 * @param  {String} description
 * @return {Void}
 */
describe('===============' + path.basename(__filename) + '=================', function () {
  /**
   * Login using user credentials. get cuf from login
   * 
   * @param {Function} done
   * @return {Void}
   */
  it('should login', function (done) {
    server
    .post(LOGIN_URL)
    .set('content-type', 'application/json')
    .send(user)
    .expect(200)
    .end(function (error) {
      expect(error).to.be.null;
      done();
    });
  });

  it('should test all mongo clients', function () {
    _.each(mongo_clients, function (client) {
      describe('Comparing mongo client objects', function () {
        it('should compare each mongo client object', function (done) {
          var query = '/?name=' + client.name;
          console.log(CLIENT_URL + query);
          var mongo_client = client;
          server
          .get(CLIENT_URL + query)
          .expect(200)
          .then(function (response) {
            var text = JSON.parse(response.text);
            var api_client = text.data[0];
            for(var attr in mongo_client) {
              if (mongo_client.hasOwnProperty(attr)) {
                expect(mongo_client[attr]).to.equal(api_client[attr]);
              }
            }
          });
          done();
        });
      });
    });
  });
});
