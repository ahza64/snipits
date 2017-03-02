 //@TODO see below
const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const testConfig = require('../config');
const server = require('../entry');
var   agent = request(server);

const Ingestions = require('dsp_shared/database/model/ingestion/tables').ingestion_files;
const ingest_file = require('../data/ingestion/ingestion_file');
const user = require('../data/auth/user');
require('../data/data_initializers/ingestion_file_init');

var cookie;
var fileId;

describe('Test ingestion file', () => {

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

  it('should post ingestion file', (done) => {
    agent
    .post(testConfig.BASE_URL + '/ingestions')
    .send(ingest_file)
    .set('Cookie', cookie)
    .end( (err, res) => {
      expect(err).to.be.null;
      if(err){
        console.log(err);
      } else {
        fileId = res.body.id
        expect(res.body.customerFileName === ingest_file.customerFileName).to.be.true;
        done();
      }
    });
  });

  it('should update description', (done) => {
    agent
    .put(testConfig.BASE_URL + '/ingestions')
    .send({fileId:  fileId, description: "new test description for put update"})
    .set('Cookie', cookie)
    .end( (err) => {
      if(err){
        done(err);
      } else {
        Ingestions.find({where: {customerFileName: ingest_file.customerFileName}})
        .then((res) => {
          expect(res.description === "new test description for put update").to.be.true;
          done();
        })
        .catch((err) => {
          done(err);
        });
      }
    });
  });
/**
  @see the following it block requires s3 access
*/
//   it('should update file name for postgres and s3', (done) => {
//     agent
//     .put(testConfig.BASE_URL + '/ingestions/config')
//     .set('Cookie', cookie)
//     .end( (err, res) => {
//       if(err){
//         console.log(err);
//       } else {
// // =========> @TODO needs s3 access
//         done();
//       }
//     });
//   });

  it('should get number of ingestions on comapny id', (done) => {
    agent
    .get(testConfig.BASE_URL + '/ingestions/total/' + ingest_file.companyId)
    .set('Cookie', cookie)
    .end( (err, res) => {
      if(err){
        console.log(err);
      } else {
        expect(res.body === 1).to.be.true;
        done();
      }
    });
  });

  it('should get all (1) ingestions on comapny id', (done) => {
    agent
    .get(testConfig.BASE_URL + '/ingestions/all/' + ingest_file.companyId + '/' + "0")
    .set('Cookie', cookie)
    .end( (err, res) => {
      if(err){
        console.log(err);
      } else {
        expect(res.body[0].s3FileName === ingest_file.s3FileName).to.be.true;
        done();
      }
    });
  });

  it('should get 1 ingestion on comapny id & file name', (done) => {
    agent
    .get(testConfig.BASE_URL + '/ingestions/' + ingest_file.customerFileName + '/' + ingest_file.companyId)
    .set('Cookie', cookie)
    .end( (err, res) => {
      if(err){
        console.log(err);
      } else {
        expect(res.body.s3FileName === ingest_file.s3FileName).to.be.true;
        done();
      }
    });
  });

  it('should search for file name on company id', (done) => {
    var partial_search = 'ad';
    agent
    .get(testConfig.BASE_URL + '/searchingestions/' + ingest_file.companyId + '/' + partial_search)
    .set('Cookie', cookie)
    .end( (err, res) => {
      if(err){
        console.log(err);
      } else {
        expect(res.body[0].s3FileName === ingest_file.s3FileName).to.be.true;
        expect(res.body[0].fileName !== partial_search).to.be.true;
        done();
      }
    });
  });

});
