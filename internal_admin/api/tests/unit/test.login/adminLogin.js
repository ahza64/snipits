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
*/
