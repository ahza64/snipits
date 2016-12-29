//  Must have valid project-id AND companyId
//@TODO fix ingestionConfigurationId

const chai = require('chai');
const _ = require('underscore');
const expect = chai.expect;
const should = chai.should();
const request = require('supertest');
const testConfig = require('../config');
const server = require('../entry');
const admin = require('../data/login/admin');
var agent = request(server);
const test_watcher = require('../data/watcher/watcher');
const URL = testConfig.BASE_URL + '/watcher';
var found_watcher;
var cookie;

describe('Test for "watcher" methods', function () {
  //login
  it('Should log in', done => {
    console.log(testConfig.BASE_URL + '/login');
    agent
    .post(testConfig.BASE_URL + '/login')
    .send({email: admin.email, password: '123'})
    .end((err, res) => {
      cookie = res.header['set-cookie'].map(function(r) {
        return r.replace('; path=/; httponly', '');
      }).join('; ');
      expect(err).to.equal(null);
      done();
     });
  });

  it('inserts a watcher', function (done) {
    agent
    .post(URL)
    .send(test_watcher)
    .set('Cookie', cookie)
    .end(function (err, res) {
      if(err){
        console.error(err);
      }
      res.status.should.not.equal(404);
      done();
    });
  });

  it('should get watcher with the configuration id', function (done) {
    agent
    .get(URL + '/' + test_watcher.ingestionConfigurationId)
    .set('Cookie', cookie)
    .expect(200)
    .end(function (err, res) {
      if(err){
        console.error(err);
      }
      found_watcher = _.find(res.body, function (item) {
        return item.email === test_watcher.email;
      });
      console.log("Searching for watcher by email...");
      console.log(found_watcher.email, "ID:" + found_watcher.id);
      done();
    });
  });

  it('Should delete the watcher', function (done) {
    agent
    .delete(URL + '/' + found_watcher.id)
    .set('Cookie', cookie)
    .expect(200)
    .end(function (err, res) {
      if(err){
        console.error(err);
      }
      res.body.should.equal(1);
      done();
    });
  });
});
