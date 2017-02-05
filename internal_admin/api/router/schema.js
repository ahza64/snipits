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
  '/schemas/:projectId',
  function*() {
    var companyId = this.req.user.companyId;
    var projectId = this.params.projectId;
    console.log('c =============> ', companyId);
    console.log('p =============> ', projectId);
    var self = this;
    if (permissions.has(this.req.user, companyId)) {
      yield QowSchemas.findAll({
        where: {
          workProjectId: projectId,
         },
        raw: true
      })
      .then(found => {
        console.log("res---------->", found);
        self.body = found;
      }, notFound =>{
        console.log("notFound", notFound);
      });
  }
});

app.use(router.routes());

module.exports = app;
