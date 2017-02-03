// Modules
const koa = require('koa');
const router = require('koa-router')();
const permissions = require('./permissions');
const config = require('dsp_shared/conf.d/config')
// App
const app = koa();

// Constants
const ACTIVE = 'active';
const INACTIVE = 'inactive';

// Collection
const Projects = require('dsp_shared/database/model/ingestion/tables').work_projects;
const QowSchemas = require('dsp_shared/database/model/ingestion/tables').qow_schemas;

// Get all user schemas
router.get(
  '/schemas',
  function*() {
    var body = this.request.body;
    console.log('/schema?companyId=:companyId&projectId', this.request);
    console.log('user', this.req.user);
    var companyId = body.companyId;
    var projectId = body.projectId;

    if (permissions.has(this.req.user, companyId)) {
      var schemas = yield QowSchemas.find({
        where: {
          projectId: projectId,
         },
        raw: true
      });

      if(schemas) {
        return schemas;
      } else {
      this.throw(403);
    }
  }
});

app.use(router.routes());

module.exports = app;
