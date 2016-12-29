/*
const chai = require('chai');
const expect = chai.expect;
const testConfig = require('../config');
const admin = require('../data/login/admin');
var cookie;
function getCookie(agent) {
  console.log(testConfig.BASE_URL + '/login');
  agent
  .post(testConfig.BASE_URL + '/login')
  .send({ email: admin.email, password: '123'})
  .end((err, res) => {
    expect(err).to.equal(null);
    console.log(res.body);
    return res.header['set-cookie'].map(function(r) {
      return r.replace('; path=/; httponly', '');
    }).join('; ');
  });
}
module.exports = getCookie;



it('should logout', function (done) {
  agent
  .get(testConfig.BASE_URL + '/logout')
  .expect(200)
  .end(function (err, res) {
    res.body.should.be.true;
    if(err){
      console.error(err);
    } else {
      console.log('Logged out!');
    }
    done();
  });
});

*/
