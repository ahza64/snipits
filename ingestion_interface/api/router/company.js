// Modules
const koa = require('koa');
const router = require('koa-router')();
const s3 = require('dsp_shared/aws/s3');
const authRole = require('../middleware/auth').authRole;

// App
const app = koa();

// Collection
const Companies = require('../model/tables').companies;

// Get all companies
router.get(
  '/company',
  authRole,
  function*() {
    var companies = yield Companies.findAll({ raw: true });
    console.log('Get all companies: ', companies);
    this.body = companies;
  }
);

// Create a company
router.post(
  '/company',
  authRole,
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
    yield s3.createBucket(company.name.toLowerCase() + '.ftp');
    this.body = true;
  }
);

app.use(router.routes());

module.exports = app;