
const chai = require('chai');
const expect = chai.expect;
const should = chai.should();

const request = require('supertest');
const server = require('../entry');
var agent = request(server);
const admin = require('../data/login/admin');
const testConfig = require('../config');
const test_config = require('../data/config/ingestion_configuration');


const URL = testConfig.BASE_URL + '/config';
const Admin = require('dsp_shared/database/model/ingestion/tables').dispatchr_admins;

describe('Test for "config ingestion" methods', function () {
console.log("-------------------", test_config);
  before(function(done){
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

  it('logs in admin', done => {
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

  it('post configuration', () => {
    console.log("inserting config with name: " + test_config.description);
    agent
    .post(testConfig.BASE_URL + '/config')
    .send(test_config)
    .set('Cookie', cookie)
    .end(function (err, res) {
      if(err){
        console.error(err);
      }
      console.log('result of post', res.body);
      res.status.should.not.equal(404);
      done();
    })
  });
});
