/* globals describe, it,  before, after */


//module
const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const testConfig = require('../config');
const server = require('../entry');
var agent = request(server);

const Admin = require('dsp_shared/database/model/ingestion/tables').dispatchr_admins;

console.log(Admin);

const admin = require('../data/login/admin');

describe('Login', function(){

  before(function(done){
    console.log('===================== Login =====================');
      Admin.create(admin).then(() => {
        done();
      });
  });

  after(function(done){
    Admin.destroy({
      where: {
        email: admin.email
      }
    }).then(() => {
      done();
    });
  });

  it('Should log in', done => {
    console.log(testConfig.BASE_URL + '/login');
    agent
    .post(testConfig.BASE_URL + '/login')
    .send({ email: admin.email, password: '123'})
    .end((err, res) => {
      if(err){
        console.error(err);
      } else {
        expect(err).to.equal(null);
        expect(res.body).to.be.an('object');
        expect(res.body.id).to.equal(admin.id);
        console.log(res.body);
        done();
      }
    })
  })
});
