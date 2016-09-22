// Modules
const koa = require('koa');
const router = require('koa-router')();

// App
const app = koa();

// Collection
const Users = require('../model/tables').users;
const Companies = require('../model/tables').companies;

// Create a user
router.post('/user', function*() {
  var temp = this.request.body;
  var company = temp.company;

  company = yield Companies.findOne({ 
    where: { name: company },
    raw: true
  });
  var companyId = company.id;

  var user = {
    name: temp.firstname + ' ' + temp.lastname,
    email: temp.email,
    password: temp.password,
    role: temp.role,
    companyId: companyId
  };

  yield Users.create(user);
  this.body = user;
});

app.use(router.routes());

module.exports = app;