/* globals describe, it,  before, after */

//module
const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const testConfig = require('../config');
const server = require('../entry');
var   agent = request(server);

const Users = require('dsp_shared/database/model/ingestion/tables').users;


const user = require('../data/auth/user');

console.log(Users);
console.log(user);

describe('Login', () => {

  before((done) => {
    console.log('===================== Login =====================');
    Users.create(user).then(() => {
      console.log('DONE');
      done();
    });
  });

  after((done) => {
    Users.destroy({
      where: {
        email: user.email
      }
    }).then(() => {
      done();
    })
  });

  it('Should log in', done => {
    console.log(testConfig.BASE_URL + '/login');
    agent
    .post(testConfig.BASE_URL + '/login')
    .send({ email: user.email, password: '123'})
    .end( (err, res) => {
      if(err){
        console.error(err);
      } else {
        console.log('RESULT', res.body);
        done();
      }
    })
  });
})
