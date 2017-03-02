// Modules
const koa = require('koa');
const router = require('koa-router')();
const permissions = require('./permissions');
const notifications = require('./notifications');
const ACTIVE = 'active';
const INACTIVE = 'inactive';

// App
const app = koa();

// Collection
const Users = require('dsp_shared/database/model/ingestion/tables').users;
const Companies = require('dsp_shared/database/model/ingestion/tables').companies;
const Admins = require('dsp_shared/database/model/ingestion/tables').dispatchr_admins;

// Create / update a user
router.post(
  '/user',
  function*() {
    if (permissions.has(this.req.user, null)) {
      var body = this.request.body;
      if (body.id) {
        this.body = yield updateUser(body);
      } else {
        var companyId = body.companyId;
        var companyName = body.company;
        if ((!companyId) && (companyName)) {
          company = yield Companies.findOne({
            where: { name: companyName },
            raw: true
          });
          companyId = company.id;
        }
        if (!companyName) {
          company = yield Companies.findOne({
            where: { id: companyId },
            raw: true
          });
          companyName = company.name;
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
          user = yield Admins.create(user);
          // console.log('In body role', user);
        } else {
          user = yield Users.create(user);
          // console.log('In else part', user);
          yield notifications.userCreated(companyName, user, body.password);
        }

        this.body = user;
      }
    } else {
      this.throw(403);
    }
  }
);

var updateUser=function*(body) {
  var user;
  if (body.role) {
    user = yield Admins.find({ where: {id: body.id } });
  } else {
    user = yield Users.find({ where: {id: body.id } });
  }

  var attributes = {
    name: body.firstname + ' ' + body.lastname,
    email: body.email
  };
  if (body.password) {
    attributes.password = Users.build().generateHash(body.password);
  }

  return yield user.updateAttributes(attributes);
}

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
    var userId = this.params.id;
    if (userId && permissions.has(this.req.user, null)) {
      try {
        if (this.query.role) {
          this.body = yield Admins.destroy({ where: { id: userId } });
        } else {
          this.body = yield Users.destroy({ where: { id: userId } });
        }
      } catch (err) {
        console.error(err);
        this.throw(500);
      }
    } else {
      this.throw(403);
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
