// Modules
const koa = require('koa');
const router = require('koa-router')();
const permissions = require('./permissions');
const ACTIVE = 'active';
const INACTIVE = 'inactive';

// App
const app = koa();

// Collection
const Users = require('dsp_shared/database/model/ingestion/tables').users;
const Companies = require('dsp_shared/database/model/ingestion/tables').companies;
const Admins = require('dsp_shared/database/model/ingestion/tables').dispatchr_admins;

// Create a user
router.post(
  '/user',
  function*() {
    if (permissions.has(this.req.user, null)) {
      var body = this.request.body;

      var companyId = body.companyId;
      if ((!companyId) && (body.company)) {
        company = yield Companies.findOne({
          where: { name: body.company },
          raw: true
        });
        companyId = company.id;
      }

      var user = {
        name: body.firstname + ' ' + body.lastname,
        email: body.email,
        password: Users.build().generateHash(body.password),
        status: ACTIVE,
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
  }
);

router.put(
  '/users/:id/deactivate',
  function*() {
    try {
      var user;
      if (this.query.role) {
        user = yield Admins.find({ where: {id: this.params.id } });
      } else {
        user = yield Users.find({ where: {id: this.params.id } });
      }
      yield user.updateAttributes({ status: INACTIVE });
      this.body = user;
    } catch (err) {
      console.error(err);
    }
  }
);

router.put(
  '/users/:id/activate',
  function*() {
    try {
      var user;
      if (this.query.role) {
        user = yield Admins.find({ where: {id: this.params.id } });
      } else {
        user = yield Users.find({ where: {id: this.params.id } });
      }
      yield user.updateAttributes({ status: ACTIVE });
      this.body = user;
    } catch (err) {
      console.error(err);
    }
  }
);

router.delete(
  '/users/:id',
  function*() {
    try {
      var user = yield Users.find({ id: this.params.id });
      this.body = yield user.updateAttributes({ deleted: true, deletedAt: new Date()});
    } catch (err) {
      console.error(err);
    }
  }
);

router.get(
  '/users',
  function*() {
    var users = [];
    try {
      users = [
        ...yield Users.findAll({
          include: [ { model: Companies, attributes: ['name'] } ]
        }),
        ...yield Admins.findAll({
          include: [ { model: Companies, attributes: ['name'] } ]
        })
      ];
    } catch (err) {
      console.error(err);
    }

    this.body = users;
  }
);

app.use(router.routes());

module.exports = app;
