
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
var test_expected = require('../data/taxonomy/expected');
const URL = testConfig.BASE_URL + '/taxonomies';
const TAX_URL = testConfig.BASE_URL + '/taxFields';
const ExpectedTaxonomies = require('dsp_shared/database/model/ingestion/tables').qow_expected_taxonomies;
var cookie;
var expTaxId;
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

  it('should post a taxonomy definition', (done) => {
    agent
    .post(URL)
    .send([test_definition])
    .set('Cookie', cookie)
    .end(function (err, res) {
      if(err){
        done(err);
      }
      expect(res.body[0].id === test_definition.id).to.be.true;
      done();
    });
  });

  it('should post an expected taxonomy', (done) => {
    agent
    .post(TAX_URL)
    .send(test_expected)
    .set('Cookie', cookie)
    .end(function (err, res) {
      if(err){
        done(err);
      }
      expTaxId = res.body.id;
      expect(res.body.fieldValue === test_expected.fieldValue).to.be.true;
      done();
    });
  });

  it('should edit an expected taxonomy', function (done) {
      test_expected.fieldValue = "test expected edited";
      test_expected.id = expTaxId;
      agent
      .post(TAX_URL)
      .send(test_expected)
      .set('Cookie', cookie)
      .end(function (err, res) {
        if(err){
          done(err);
        }
        expect(res.body.fieldValue === "test expected edited").to.be.true;
        done();
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
      // TODO test body.values too when we build the value tests. will need to move the order
      expect(res.body.taxonomies[0].id === test_definition.id).to.be.true;
      done();
    });
  });

  it('should delete an expected taxonomy', (done) => {
    agent
    .delete(TAX_URL + "/" + expTaxId)
    .send()
    .set('Cookie', cookie)
    .end(function (err, res) {
      if(err){
        done(err);
      }
      expect(res.body === 1).to.be.true;
      done();
    });
  });

  it('should delete a group of expected taxonomies', (done) => {
    test_expected.id = null;
    agent
    .post(TAX_URL)
    .send(test_expected)
    .set('Cookie', cookie)
    .end(function (err, res) {
      if(err){
        done(err);
      }
      agent
      .post(TAX_URL)
      .send(test_expected)
      .set('Cookie', cookie)
      .end(function (err, res) {
        if(err){
          done(err);
        }
        agent
        .delete(TAX_URL + "/schema/" + test_expected.qowSchemaId)
        .send()
        .set('Cookie', cookie)
        .end(function (err, res) {
          if(err){
            done(err);
          }
          expect(res.body === 2).to.be.true;
          done();
        });
      });
    });
  });

});
