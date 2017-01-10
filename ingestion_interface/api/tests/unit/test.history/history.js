
const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const testConfig = require('../config');
const server = require('../entry');
var   agent = request(server);

const Histories = require('dsp_shared/database/model/ingestion/tables').ingestion_histories;

const user = require('../data/login/user');
const history = require('../data/history/history');

require('../data/data_initializers/history_init');

var cookie;
var fileId;

describe('History test', () => {

  it('should log in', done => {
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

  it('should create new history log', (done) => {
    agent
    .post(testConfig.BASE_URL + '/history')
    .send(history)
    .set('Cookie', cookie)
    .end( (err, res) => {
      if(err){
        console.log(err);
      } else {
        Histories.find({where: {customerFileName: history.customerFileName}})
        .then((res) => {
          expect(res.dataValues.customerFileName === history.customerFileName).to.be.true;
          done();
        })
        .catch((err) => {
          console.log(err);
        });
      }
    });
  });

  it('should get history logs on companyId', (done) => {
    Histories.create(history)
    .then((res) => {
      agent
      .get(testConfig.BASE_URL + '/history/' + history.companyId)
      .set('Cookie', cookie)
      .end( (err, res) => {
        if(err){
          console.log(err);
        } else {
          expect(res.body.historiesData['02 2'].length === 2).to.be.true;
          expect(res.body.historiesData['02 2'][0].email === user.email).to.be.true;
          done();
        }
      });
    })
    .catch((err) => {
      console.log(err);
    });
  });

});
