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

const admin = {
  "id": 1,
  "name": "admin",
  "email": "123",
  "password": "$2a$08$J0vVDcJB8ypXPGAlsoNjk.yuivcuaadUTBdvitEYddGBYGTkWBckS",
  "status": "active",
  "role": "DA",
  "createdAt": Date.now(),
  "updatedAt": Date.now()
}

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
        id: 1
      }
    }).then(() => {
      done();
    });
  });

  it('Should log in', done => {
    console.log(testConfig.BASE_URL + '/login');
    agent
    .post(testConfig.BASE_URL + '/login')
    .send({ email: admin.email, password: admin.password})
    .end((err, res) => {
      expect(err).to.equal(null);
      console.log(res.body);
      // expect(res.body.data).to.be.an('object');
      // expect(res.body.data.id).to.equal(admin.id);
      done();
    })
  })
});
