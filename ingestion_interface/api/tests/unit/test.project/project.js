
const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const testConfig = require('../config');
const server = require('../entry');
var   agent = request(server);

const company = require('../data/company/company');
const project = require('../data/project/project');
const user = require('../data/login/user');

require('../data/data_initializers/ingestion_configuration_init');

var cookie;


describe('Test finding the projects', () => {

  it('Should log in', done => {
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

  it('should find a project', (done) => {
    agent
    .get(testConfig.BASE_URL + '/projects/' + company.id)
    .set('Cookie', cookie)
    .end( (err, res) => {
      if(err){
        console.log(err);
      } else {
        expect(res.body[0].name === project.name).to.be.true;
        done();
      }
    });
  });

});
