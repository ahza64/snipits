// Modules
const koa = require('koa');
const router = require('koa-router')();
const permissions = require('./permissions');
// App
const app = koa();
const _ = require('underscore');

// Constants
const ACTIVE = 'active';
const INACTIVE = 'inactive';

// Collection
const QowSchemas = require('dsp_shared/database/model/ingestion/tables').qow_schemas;
const QowFields = require('dsp_shared/database/model/ingestion/tables').qow_fields;
// Get all user schemas
router.get(
  '/schemas/:projectId',
  function*() {
    var companyId = this.req.user.companyId;
    var projectId = this.params.projectId;
    var self = this;
    if (permissions.has(this.req.user, companyId)) {
      var userSchemas = yield QowSchemas.findAll({
        where: {
          workProjectId: projectId,
         },
        raw: true
      })
      this.body = userSchemas;
    }
  }
);

router.put(
  '/schemas/:projectId',
  function*() {
  var companyId = this.req.user.companyId;
  var projectId = this.params.projectId;
  var body = this.request.body;
  var name = body.name;
  var schemaId = body.id || null;
  var created;

  if (permissions.has(this.req.user, companyId)) {
    var targetSchema = yield QowSchemas.findOne({
      where: {
        workProjectId: projectId,
        id: schemaId
       },
      raw: true
    })
    console.log("targetSchema", targetSchema);
    var version = targetSchema ? targetSchema.version : 0;

    try {
      created = yield QowSchemas.create({
        name: name,
        workProjectId: projectId,
        version: version + 1,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
    } catch (e) {
      console.error(e);
    }
    this.body = created;
  }

});

router.delete('/schema/:schemaId', function* () {
  var companyId = this.req.user.companyId;
  var schemaId = this.params.schemaId;
  if (permissions.has(this.req.user, companyId)) {
    var targetSchema = yield QowSchemas.find({where: {id: schemaId}})
    yield targetSchema.update( {status : !targetSchema.status})
    this.body = targetSchema;
  }

})

router.get('/schema/:schemaId', function* () {
  var companyId = this.req.user.companyId;
  var schemaId = this.params.schemaId;
  if (permissions.has(this.req.user, companyId)) {
    var targetSchema = yield QowSchemas.findOne({
        id:schemaId
    });
    var version = targetSchema.dataValues.version;
    var targetFields = yield QowFields.findAll({
      where : {
        qowSchemaId : schemaId,
        version: version
      }
    });

    var vals = _.pluck(targetFields, 'dataValues');
    this.body = vals;
  }
});

  router.put('/schemaField/:schemaId', function* () {
    if (permissions,has(this.req.user, this.req.user.companyId)) {

    }
  });
app.use(router.routes());

module.exports = app;
