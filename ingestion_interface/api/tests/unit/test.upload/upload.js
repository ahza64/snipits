const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const testConfig = require('../config');
const config = require('../data/config/config')
const ingestion_file = require('../data/ingestion/ingestion_file')
const server = require('../entry');
var   agent = request(server);
const get_url = '/check/same' //followed by /:configId/:fileName
require('../data/data_initializers/upload_init');
//
const user = require('../data/auth/user');

var cookie;


describe('Test uploading files', () =>{

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



	it('should check if file exists', (done) => {
		agent
		.get(testConfig.BASE_URL + get_url + "/" + config.id + "/" + ingestion_file.customerFileName)
		.set('Cookie', cookie)
	    .end( (err, res) => {
	      if(err){
	        done(err);
	      } else {
			  console.log("Checking for ingestion file from predefined configID and filename");
	          expect(res.body).to.be.true;
			  done();
	      }
	      });
	});
});
