const chai = require('chai');
const expect = chai.expect;
const should = chai.should();
const request = require('supertest');
const testConfig = require('../config');
const server = require('../entry');
const admin = require('../data/login/admin');
var agent = request(server);
const test_project = require('../data/projects/project');
const URL = testConfig.BASE_URL + '/project';
const ACTIVE = 'active';
const INACTIVE = 'inactive';
const Admin = require('dsp_shared/database/model/ingestion/tables').dispatchr_admins;

var project_id;

describe('Create a project', function () {

  //create/destroy admin for test
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

  //login
  it('Should log in', function(done) {
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
        console.log('Inserted ID ------------>', res.body.id);
      }
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
      } else {
        console.log('PUT deactivate response ----->', res.body);
      }
      expect(res.body.status).to.equal(INACTIVE)
      done();
    });
  });

  it('Should change status from inactive to active via put', function (done) {
    agent
    .put(URL + '/' + project_id + '/activate')
    .set('Cookie', cookie)
    .expect(200)
    .end(function (err, res) {
      if(err){
        console.error(err);
      } else {
        console.log('PUT activate response ----->', res.body);
      }
      expect(res.body.status).to.equal(ACTIVE);
      done();
    });
  });

  it('Should delete the project', function (done) {
    agent
    .delete(URL + '/' + project_id)
    .set('Cookie', cookie)
    .expect(200)
    .end(function (err, res) {
      if(err){
        console.error(err);
      } else {
        console.log('Delete response ----->', res.body);
      }
      done();
    });
  });

  //GET Uses PLURAL '/projects'
  it('checks that project was actually inserted', function (done) {
    agent
    .get(URL + 's/' + test_project.companyId)
    .expect(200)
    .set('Cookie', cookie)
    .end(function (err, res) {
      console.log("Getting company projects", res.body);
      expect(err).to.be.null;
      if(err){
        console.error(err.status);
      }
      done();
    });
  });

});
