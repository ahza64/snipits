// Modules
const koa = require('koa');
const router = require('koa-router')();

// App
const app = koa();

// Collection
const Companies = require('../model/tables').companies;

// Get all companies
router.get('/company', function*() {
  var companies = yield Companies.findAll({ raw: true });
  console.log('Get all companies: ', companies);
  this.body = companies;
});

// Create a company
router.post('/company', function*() {
  var company = this.request.body;
  var exists = yield Companies.count({
    where: { company: company.company },
    raw: true
  });
  if (exists) {
    this.body = true;
    return;
  }
  
  yield Companies.create(company);
  this.body = true;
});

app.use(router.routes());

module.exports = app;