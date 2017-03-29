
const chai = require('chai');
const expect = chai.expect;
const should = chai.should();
const request = require('supertest');
const testConfig = require('../config');
const server = require('../entry');
const admin = require('../data/login/admin');
const _ = require('underscore');
var agent = request(server);
const test_definition = require('../data/taxonomy/definition');
const URL = testConfig.BASE_URL + '/taxonomies';
const Taxonomy = require('dsp_shared/database/model/ingestion/tables').qow_taxonomies;
var cookie;
require('../data/data_initializers/taxonomy_init');

describe('Taxonomy tests', function () {
  it('should log in', function (done) {
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

  it('should post a taxonomy definition', function (done) {
    agent
    .post(URL)
    .send([test_definition])
    .set('Cookie', cookie)
    .end(function (err, res) {
      if(err){
        done(err);
      }
      expect(res.body[0].id === test_definition.id).to.be.true;
      done()
    });
  });

  it('should get a taxonomy definition', (done) => {
    agent
    .get(URL + "/" + test_definition.qowSchemaId)
    .send()
    .set('Cookie', cookie)
    .end(function (err, res) {
      if(err){
        done(err);
      }
      expect(res.body.taxonomies[0].id === test_definition.id).to.be.true;
      done()
    });
  });

});
