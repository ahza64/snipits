// Modules
const koa = require('koa');
const router = require('koa-router')();
const permissions = require('./permissions');
// App
const app = koa();
const _ = require('underscore');
const diff = require('deep-diff').diff;
// Constants
const ACTIVE = 'active';
const INACTIVE = 'inactive';

// Collections
const QowSchemas = require('dsp_shared/database/model/ingestion/tables').qow_schemas;
const QowFields = require('dsp_shared/database/model/ingestion/tables').qow_fields;

// Get all user schemas
router.get(
  '/schemas/:projectId',
  function*() {
    var companyId = this.req.user.companyId;
    var projectId = this.params.projectId;
    var self = this;
    if (permissions.has(this.req.user, companyId) && projectId) {
      var userSchemas = yield QowSchemas.findAll({
        where: {
          workProjectId: projectId,
          newest: true
         },
        raw: true
      })
      this.body = userSchemas;
    }
  }
);

router.get(
  '/schemas/all',
  function*() {
    var companyId = this.req.user.companyId;
    var projectId = this.params.projectId;
    var self = this;
    if (permissions.has(this.req.user, companyId) && projectId) {
      var userSchemas = yield QowSchemas.findAll({
        where: {
          workProjectId: projectId,
          newest: true
         },
        raw: true
      })
      this.body = userSchemas;
    }
  }
);

//create a new schema
router.post(
  '/schemas/:projectId',
  function*() {
  var companyId = this.req.user.companyId;
  var projectId = this.params.projectId;
  var body = this.request.body;
  var name = body.name;
  var schemaId = body.id || null;
  var result;

  if (permissions.has(this.req.user, companyId) && projectId) {
    var targetSchema = yield QowSchemas.findOne({
      where: {
        workProjectId: projectId,
        id: schemaId
       },
      raw: true
    });
    var version = targetSchema ? targetSchema.version : 0;

    try {
      result = yield QowSchemas.create({
        name: name,
        workProjectId: projectId,
        version: version + 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: true,
        newest: true
      });
    } catch (e) {
      console.error(e);
    }
    this.body = result;
  }
});

router.put('/schema', function* () {
  if (permissions.has(this.req.user, this.req.user.companyId)) {

    var body = this.request.body;
    var fields = body.fields;
    var oldId = body.id;

    var olderOne = yield QowSchemas.findOne({where:{id:oldId}});
    yield QowSchemas.update({newest: false},{where:{id:oldId}});
    olderOne = olderOne.dataValues;

    var workProjectId = olderOne.workProjectId;
    var name = olderOne.name;
    var version = olderOne.version;

    var newSchema = {
      name:name,
      version: version + 1,
      status: true,
      newest: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      workProjectId: workProjectId,
    };

    newSchema = yield QowSchemas.create(newSchema);
    newSchema = newSchema.dataValues;

    _.each(fields, (field) => {
      field.id = null;
      field.createdAt = Date.now();
      field.updatedAt = Date.now();
      field.version = newSchema.version;
      field.qowSchemaId= newSchema.id;
    })

    var result = yield QowFields.bulkCreate(fields);
    this.body = newSchema;
  }
})

//Get a user schema
router.get('/schema/:schemaId', function* () {
    var schemaId = this.params.schemaId;
    if (permissions.has(this.req.user, this.req.user.companyId) && schemaId) {
      var schema = yield QowSchemas.findOne({where:{id : schemaId}});
      this.body = schema.dataValues;
    }
})
//set !status of a schema
router.delete('/schema/:schemaId', function* () {

  var companyId = this.req.user.companyId;
  var schemaId = this.params.schemaId;
  if (permissions.has(this.req.user, companyId) && schemaId) {
    var update = yield QowSchemas.update({
      newest:false
    },{
      where: { id: schemaId }
    });
    console.log(update);
    this.body = update;
  }
})

//get a specific field
router.get('/schemaField/:schemaId', function* () {
  var companyId = this.req.user.companyId;
  var schemaId = this.params.schemaId;
  if (permissions.has(this.req.user, companyId) && schemaId) {
    var targetFields = yield QowFields.findAll({
      where : {
        qowSchemaId : schemaId,
        status: true
      }
    });
    var vals = _.pluck(targetFields, 'dataValues');
    this.body = vals;
    }
  });



app.use(router.routes());

module.exports = app;
