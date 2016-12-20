// Modules
const koa = require('koa');
const router = require('koa-router')();
const permissions = require('./permissions');

// App
const app = koa();

// Constants
const ACTIVE = 'active';
const INACTIVE = 'inactive';

// Collection
const Projects = require('dsp_shared/database/model/ingestion/tables').work_projects;

// Get projects by companyId
router.get(
  '/projects/:companyId',
  function*() {
    var companyId = this.params.companyId;
    if (!companyId) {
      return this.body = [];
    }

    if (permissions.has(this.req.user, companyId)) {
      var projects = [];
      try {
        projects = yield Projects.findAll({
          where: { companyId: companyId },
          raw: true
        });
      } catch (err) {
        console.error(err);
      }

      this.body = projects;
    } else {
      this.throw(403);
    }
  }
);

app.use(router.routes());

module.exports = app;
