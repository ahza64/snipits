// Modules
const koa = require('koa');
const router = require('koa-router')();
const s3 = require('dsp_shared/aws/s3');
const config = require('dsp_shared/conf.d/config.json').admin;

// App
const app = koa();

// Collection
const Companies = require('dsp_shared/database/model/ingestion/tables').companies;

// Get all companies
router.get(
  '/company',
  function*() {
    var companies = yield Companies.findAll({ raw: true });
    console.log('Get all companies: ', companies);
    this.body = companies;
  }
);

// Create a company
router.post(
  '/company',
  function*() {
    var company = this.request.body;
    var exists = yield Companies.count({
      where: { name: company.name }
    });

    if (exists) {
      this.body = true;
      return;
    }
    
    yield Companies.create(company);
    yield s3.createBucket(config.env + '.' + company.name.toLowerCase() + '.ftp');
    this.body = true;
  }
);

app.use(router.routes());

module.exports = app;