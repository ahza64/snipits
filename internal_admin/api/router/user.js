// Modules
const koa = require('koa');
const router = require('koa-router')();

// App
const app = koa();

// Collection
const Users = require('dsp_shared/database/model/ingestion/tables').users;
const Companies = require('dsp_shared/database/model/ingestion/tables').companies;
const Admins = require('dsp_shared/database/model/ingestion/tables').admins;

// Create a user
router.post(
  '/user',
  function*() {
    var body = this.request.body;
    var company = body.company;

    company = yield Companies.findOne({ 
      where: { name: company },
      raw: true
    });
    var companyId = company.id;

    var user = {
      name: body.firstname + ' ' + body.lastname,
      email: body.email,
      password: body.password,
      status: 'active',
      companyId: companyId
    };

    if (body.role) {
      user.role = body.role;
      yield Admins.create(user);
    } else {
      yield Users.create(user);
    }

    this.body = user;
  }
);

app.use(router.routes());

module.exports = app;