const chai = require('chai');
const _ = require('underscore');
const expect = chai.expect;
const should = chai.should();
const request = require('supertest');
const testConfig = require('../config');
const server = require('../entry');
const admin = require('../data/login/admin');
var agent = request(server);
const test_user = require('../data/user/user');
const URL = testConfig.BASE_URL + '/users';
const ACTIVE = 'active';
const INACTIVE = 'inactive';
require('../helper');
var found_user;
var user_id;
var cookie;

describe('Test for "user" methods', function () {
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

  it('inserts a user', function (done) {
    this.timeout(5000);
    console.log("inserting user with name: " + test_user.firstname);
    agent
    .post(testConfig.BASE_URL + '/user')
    .send(test_user)
    .set('Cookie', cookie)
    .end(function (err, res) {
      if(err){
        console.error(err);
      } else {
        done();
      }
      res.body.email.should.equal(test_user.email);
      res.status.should.not.equal(404);
    })
  });

  it('Should find userID', function (done) {
    agent
    .get(URL)
    .set('Cookie', cookie)
    .end(function (err, res) {
      if(err){
        console.error(err);
      }
      res.status.should.not.equal(404);
      found_user = _.find(res.body, function (user) {
        return user.email === test_user.email;
      });
      expect(found_user).to.exist;
      done();
    });
  });

  it('Should change status from active to inactive via put', function (done) {
    user_id = found_user.id;
    agent
    .put(URL + '/' + user_id + '/deactivate')
    .set('Cookie', cookie)
    .expect(200)
    .end(function (err, res) {
      if(err){
        console.error(err);
      }
      expect(res.body.status).to.equal(INACTIVE)
      done();
    })
  });

  it('Should change status from inactive to active via put', function (done) {
    agent
    .put(URL + '/' + user_id + '/activate')
    .set('Cookie', cookie)
    .expect(200)
    .end(function (err, res) {
      if(err){
        console.error(err);
      }
      expect(res.body.status).to.equal(ACTIVE)
      done();
    })
  });

  it('Should delete the user', function (done) {
    agent
    .delete(URL + '/' + user_id)
    .set('Cookie', cookie)
    .expect(200)
    .end(function (err, res) {
      if(err){
        console.error(err);
      }
      res.body.should.equal(1);
      done();
    })
  });
});
