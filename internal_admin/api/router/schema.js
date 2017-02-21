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

//create a new schema
router.post(
  '/schemas/:projectId',
  function*() {
  var companyId = this.req.user.companyId;
  var projectId = this.params.projectId;
  var body = this.request.body;
  var name = body.name;
  var schemaId = body.id || null;
  //var status = body.status;
  var result;

  if (permissions.has(this.req.user, companyId) && projectId) {
    var targetSchema = yield QowSchemas.findOne({
      where: {
        workProjectId: projectId,
        id: schemaId
       },
      raw: true
    });
    console.log("targetSchema", targetSchema);
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
    console.log("POST SCHEMA rejert", result);
    this.body = result;
  }
});
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
  console.log("DEL------------------------");

  var companyId = this.req.user.companyId;
  var schemaId = this.params.schemaId;
  if (permissions.has(this.req.user, companyId) && schemaId) {
    var targetSchema = yield QowSchemas.find({where: {id: schemaId}})
    yield targetSchema.update({status : !targetSchema.status})
    this.body = targetSchema;

    yield incrementSchema(targetSchema.dataValues);
    console.log("schema------------------------", targetSchema);
  }
})

//get a specific field
router.get('/schemaField/:schemaId', function* () {
  var companyId = this.req.user.companyId;
  var schemaId = this.params.schemaId;
  if (permissions.has(this.req.user, companyId) && schemaId) {
    var targetSchema = yield QowSchemas.findOne({
        id:schemaId
    });
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

  //Create a new schemaField
  router.post('/schemaField/:schemaId', function* () {
    var body = this.request.body;
    var schemaId = this.params.schemaId;
    console.log("body",body, "schemaId",schemaId);
    if (permissions.has(this.req.user, this.req.user.companyId)) {
      var schema = yield QowSchemas.findOne({where:{ id: schemaId }});
      if (schema){
        var field = {
          name: body.name,
          required: body.required,
          qowSchemaId: schemaId,
          version: 1,
          type: body.type,
          status: true
        };
        yield incrementSchema(schema.dataValues)
        this.body = yield QowFields.create(field);
      }
    }
  });

  //should delete a specific field
  router.delete('/schemaField/:schemaFieldId', function* () {
    if (permissions.has(this.req.user, this.req.user.companyId)) {
      var body     = this.request.body;

      var schemaFieldId = this.params.schemaFieldId;
      var targetFieldInstance = yield QowFields.findOne({where : {id:schemaFieldId} });

      var schemaId = targetFieldInstance.dataValues.qowSchemaId;
      var targetSchemaInstance = yield QowSchemas.findOne( {where : {id:schemaId} });

      if (!targetSchemaInstance){
        throw(403);
      }

      this.body = yield targetSchemaInstance.update({status: targetFieldInstance.dataValues.status});
      console.log('DELETE /schemaField/:schemaFieldId', this.body);

      yield incrementSchema( targetSchemaInstance.dataValues);
    }
  });

function* incrementSchema(schema) {
  schema.version = schema.version + 1;
  var originalSchemaId = schema.id;
  schema = _.omit(schema,['id','createdAt']);
  var updatedSchema = yield QowSchemas.create(schema);
  updatedSchema = updatedSchema.dataValues;

  yield QowSchemas.update({
    newest:false
  },{
    where:{
      id:originalSchemaId
    }
  });

  yield QowFields.update({
    qowSchemaId: updatedSchema.id
  },{
     where: {
      qowSchemaId:originalSchemaId
     }
  });

}

app.use(router.routes());

module.exports = app;
