
const chai = require('chai');
const expect = chai.expect;
const should = chai.should();
const request = require('supertest');
const testConfig = require('../config');
const server = require('../entry');
const admin = require('../data/login/admin');
const _ = require('underscore');
var agent = request(server);
const test_company = require('../data/company/company');
const URL = testConfig.BASE_URL + '/taxonomies';
const Taxonomy = require('dsp_shared/database/model/ingestion/tables').qow_taxonomies;
var cookie;
require('../data/data_initializers/taxonomy_init');

describe('Taxonomy tests', function () {
  it('Should log in', function (done) {
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

});
