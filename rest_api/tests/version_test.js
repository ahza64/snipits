/**
* @fileoverview tests the GET /route/version.js
* @author Hasnain Haider 
*/

/**
* Base URL to the server
* @var {String} BASE_URL
* @const
* @defaultvalue http://localhost:3000/api/v3

*/
const BASE_URL  = process.env.BASE_URL  || 'http://localhost:3000/api/v3';
const LOGIN_URL = '/login';
const CLIENT_URL= '/client';
var   config    = require('dsp_shared/config/config').get();
var   chai      = require('chai');
var   should    = chai.should();
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

describe('version test', function () {
/**
* Login using user credentials. get cuf from login

* @param {Function} done
* @return {Void}
*/
  it('should login', function (done) {
    server
    .post(LOGIN_URL)
    .set('content-type', 'application/json')
    .send(user)
    .end(function (error, response) {
      expect(error).to.be.null;
      response.should.have.status(200);
      done();
    });
  });

  it('should test all mongo_clients', function () {

    _.each(mongo_clients, function (client) {
      describe('Comparing client object', function () {
        it('should compare each object', function (done) {
          var query = '/?name=' + client.name;
          console.log(CLIENT_URL + query);
          var mongo_client = client;
          server
          .get(CLIENT_URL + query)
          .then(function (response) {
            response.should.have.status(200);
            var text = JSON.parse(response.text);
            var api_client = text.data[0];

            var count = 0;
            for(var attr in mongo_client) {
              console.log("comparing", attr);
              console.log(mongo_client[attr],'===',api_client[attr]);
              expect(mongo_client[attr]).to.equal(api_client[attr]);
              if (++count === _.keys(client).length)
                {done();}
            }
          });
        });//nested-it end
      });//nested-describe end
    });  //each end

  });    // it end
});      //describe end
