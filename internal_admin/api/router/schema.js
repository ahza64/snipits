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

  router.put('/schemas/:projectId', function*() {
    var companyId = this.req.user.companyId;
    var projectId = this.params.projectId;
    var body = this.request.body;
    var name = body.name;
    var schemaId = body.id || null;

    var self = this;

    if (permissions.has(this.req.user, companyId)) {
      yield QowSchemas.findOne({
        where: {
          workProjectId: projectId,
          id: schemaId
         },
        raw: true
      })
      .then((found, err) => {
        if(err){
          console.error(err);
        }
        var version;
        if (found) {
          version = found.version;
        } else {
          version = 0;
        }
        self.body = found;
        QowSchemas.create({
          name: name,
          workProjectId: projectId,
          version: version + 1,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }).then((res, err) => {
          if (err) {
            console.error(err);
          } else {
            console.log(res);
          }
        }) //then(res, err)
      }); //then(found,err)
    } //if
  });

app.use(router.routes());

module.exports = app;
