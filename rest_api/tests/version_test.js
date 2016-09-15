/**
* @fileoverview tests the GET /route/version.js
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
DOESNOT FUCKING WORK
*/
const BASE_URL  = process.env.BASE_URL  || 'http://localhost:3000/api/v3';
const LOGIN_URL = '/login';
const LOGOUT_URL= '/logout';
const CLIENT_URL= '/client';
var   config    = require('dsp_shared/conf.d/config');
var   chai      = require('chai');
var   should    = chai.should();
var   expect    = chai.expect;
var   assert    = chai.assert;
var   request   = require('supertest');
var   _         = require('underscore');
var   server    = request.agent(BASE_URL);
require('dsp_shared/database/database')(config.meteor);
var   Client    = require('dsp_shared/database/model/client');
chai.use(require('chai-http'));

/**
* @global
* The cuf who's logged in
* @var {Object} cuf

* User email and password used to authenticate
* @var {Object} user_credentials
*/
var clients;
var user_credentials = {
  email : "kcmb@pge.com",
  password: "2094951517"
};
var mongo_clients =
[
  {
    _id : '56b1491e211867232917bdb8',
    min_version: '2.3.483',
    max_version: '2.3.483',
    name: 'pge',
    upgrade_url: 'http://dispatchr.com/android/dispatchr-latest.apk'
  },{
    _id : '57d872eea4898bfadda5bf18',
    min_version: '2.2.1',
    max_version: '2.4.5',
    name: 'best-clent',
    upgrade_url: 'www.google.com'
    }
];

/**
* @param {String} description

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
    .send(user_credentials)
    .end(function (error, response) {
      expect(error).to.be.null;
      response.should.have.status(200);
      done();
    });
    // Client.find({}).then(function (doc) {
    //   clients = doc;
    //   done();
    // });
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
