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
    console.log('boody===================================', this.request.body);
    var companyId = this.req.user.companyId;
    var projectId = this.params.projectId;
    var name = this.request.body.name;
    var schemaId = this.request.body.id;
    var version = 1;
    var updatedAt = Date.now();
    var createdAt = Date.now();
    var self = this;

    if (permissions.has(this.req.user, companyId)) {
      yield QowSchemas.findOne({
        where: {
          workProjectId: projectId,
          id: schemaId
         },
        raw: true
      })
      .then(found => {
        console.log("Found", found);
        self.body = found;
        QowSchemas.create({
          name: name,
          workProjectId: projectId,
          version: found.version + 1,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }).then((err, res) => {
          if (err) {
            console.error(err);
          } else {
            console.log(res);
          }
        })
      }, notFound =>{
        console.log("notFound", notFound);
        QowSchemas.create({
          name: name,
          workProjectId: projectId,
          version: version,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }).then((err, res) => {
          if (err) {
            console.error(err);
          } else {
            console.log(res);
          }
        })
      });//nf
    } //if
  });

app.use(router.routes());

module.exports = app;
