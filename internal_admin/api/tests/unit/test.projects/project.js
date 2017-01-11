const chai = require('chai');
const expect = chai.expect;
const should = chai.should();
const request = require('supertest');
const testConfig = require('../config');
const server = require('../entry');
const admin = require('../data/login/admin');
const test_project = require('../data/projects/project');
const URL = testConfig.BASE_URL + '/project';
const ACTIVE = 'active';
const INACTIVE = 'inactive';
const INIT_NUM_PROJECTS = 0;
var agent = request(server);
var cookie;
var project_id;
require('../data/data_initializers/admin_init');
require('../data/data_initializers/company_init');

describe('Project tests', function () {
  it('Should log in', function(done) {
    console.log(testConfig.BASE_URL + '/login');
    agent
    .post(testConfig.BASE_URL + '/login')
    .send({email: admin.email, password: '123'})
    .end((err, res) => {
      if(err){
        done(err);
      }
      cookie = res.header['set-cookie'].map(function(r) {
        return r.replace('; path=/; httponly', '');
      }).join('; ');
      expect(err).to.equal(null);
      done();
    });
  });

  it('inserts a project', function (done) {
    console.log("inserting project with name: " + test_project.name);
    agent
    .post(URL)
    .send(test_project)
    .set('Cookie', cookie)
    .end(function (err, res) {
      if(err){
        console.error(err);
      } else {
        console.log('Inserted ID (from response) ------------>', res.body.id);
      }
      console.log('');
      expect(res.body.name).to.equal(test_project.name);
      project_id = res.body.id;
      done();
    });
  });

  it('Should change status from active to inactive via put', function (done) {
    agent
    .put(URL + '/' + project_id + '/deactivate')
    .set('Cookie', cookie)
    .expect(200)
    .end(function (err, res) {
      if(err){
        console.error(err);
      }
      expect(res.body.status).to.equal(INACTIVE);
      done();
    });
  });

  it('Should change status from inactive to active via put', function (done) {
    agent
    .put(URL + '/' + project_id + '/activate')
    .set('Cookie', cookie)
    .expect(200)
    .end(function (err, res) {
      console.log('expect product to be "active"');
      if(err){
        console.error(err);
      }
      expect(res.body.status).to.equal(ACTIVE);
      done();
    });
  });

//success response body is empty
  it('Should delete the project', function (done) {
    agent
    .delete(URL + '/' + project_id)
    .set('Cookie', cookie)
    .expect(200)
    .end(function (err, res) {
      if(err){
        console.error(err);
      } else {
        console.log('Deleted project');
      }
      done();
    });
  });

  //GET Uses PLURAL '/projects'
  it('checks that project was actually Deleted', function (done) {
    agent
    .get(URL + 's/' + test_project.companyId)
    .expect(200)
    .set('Cookie', cookie)
    .end(function (err, res) {
      console.log("Getting company projects, found ", res.body.length);
      expect(err).to.be.null;
      if(err){
        console.error(err.status);
      }
      res.body.should.have.length(INIT_NUM_PROJECTS);
      res.body.should.not.contain(test_project);
      done();
    });
  });

});
