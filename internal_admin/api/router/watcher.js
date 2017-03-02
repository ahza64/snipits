// Modules
const koa = require('koa');
const router = require('koa-router')();
const permissions = require('./permissions');

// App
const app = koa();

// Collection
const Watchers = require('dsp_shared/database/model/ingestion/tables').ingestion_watchers;
const Companies = require('dsp_shared/database/model/ingestion/tables').companies;
const Configurations = require('dsp_shared/database/model/ingestion/tables').ingestion_configurations;

// Create a watcher
router.post(
  '/watcher',
  function*() {
    var body = this.request.body;
    var companyId = body.companyId;
    var ingestionConfigurationId = body.ingestionConfigurationId;
    var email = body.email;

    if (ingestionConfigurationId && email && permissions.has(this.req.user, null)) {
      try {
        this.body = yield Watchers.create({
          companyId: companyId,
          ingestionConfigurationId: ingestionConfigurationId,
          email: email
        });
      } catch(e) {
        console.error(e);
        this.throw(500);
      }
    } else {
      this.throw(403);
    }
  }
);

// Delete a watcher by id
router.delete(
  '/watcher/:id',
  function*() {
    var watcherId = this.params.id;

    if (watcherId && permissions.has(this.req.user, null)) {
      try {
        this.body = yield Watchers.destroy({ where: { id: watcherId }, raw: true });
      } catch(e) {
        console.error(e);
        this.throw(500);
      }
    } else {
      this.throw(403);
    }
  }
);

// Get watchers by ingestionConfigurationId
router.get(
  '/watcher/:ingestionConfigurationId',
  function*() {
    var ingestionConfigurationId = this.params.ingestionConfigurationId;

    if (ingestionConfigurationId && permissions.has(this.req.user, null)) {
      try {
        this.body = yield Watchers.findAll({
          where: { ingestionConfigurationId: ingestionConfigurationId },
          include: [
            { model: Companies, attributes: [ 'name' ] },
            { model: Configurations, attributes: [ 'workProjectId', 'fileType', 'description', 'status' ] }
          ],
          raw: true
        });
      } catch(e) {
        console.error(e);
        this.throw(500);
      }
    } else {
      this.throw(403);
    }
  }
);

app.use(router.routes());

module.exports = app;