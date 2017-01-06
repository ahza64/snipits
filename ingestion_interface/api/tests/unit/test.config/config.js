
const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const testConfig = require('../config');
const server = require('../entry');
var   agent = request(server);

const Users = require('dsp_shared/database/model/ingestion/tables').users;
//
const Companies = require('dsp_shared/database/model/ingestion/tables').companies;
const Projects = require('dsp_shared/database/model/ingestion/tables').work_projects;

const company = require('../data/company/company');
const project = require('../data/project/project');
const test_config = require('../data/config/config');

require('../data/data_initializers/ingestion_configuration_init');
//
const user = require('../data/login/user');

var cookie;

describe('Test project configuration', () => {

  it('Should log in', done => {
    // console.log(testConfig.BASE_URL + '/login', user);
    agent
    .post(testConfig.BASE_URL + '/login')
    .send({ email: user.email, password: '123'})
    .end( (err, res) => {
      cookie = res.header['set-cookie'].map(function(r) {
        return r.replace('; path=/; httponly', '');
      }).join('; ');
      expect(err).to.equal(null);
      done();
    })
  });

  it('should get project configuration', (done) => {
    agent
    .get(testConfig.BASE_URL + '/configs/' + project.id)
    .set('Cookie', cookie)
    .end( (err, res) => {
      if(err){
        console.log(err);
      } else {
        expect(res.body[0].fileType === test_config.fileType).to.be.true;
        done();
      }
    });
  });

});
