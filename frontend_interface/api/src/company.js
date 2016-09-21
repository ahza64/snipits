// Modules
const koa = require('koa');
const router = require('koa-router')();

// App
const app = koa();

// Collection
const Companies = require('dsp_shared/database/model/platform/companies');

// Get all companies
router.get('/company', function*() {
  var companies = yield Companies.find();
  console.log('Get all companies: ', companies);
  this.body = companies;
});

// Create a company
router.post('/company', function*() {
  var company = this.request.body;
  yield Companies.update(company, { $setOnInsert: company }, { upsert: true });
  this.body = true;
});

app.use(router.routes());

module.exports = app;