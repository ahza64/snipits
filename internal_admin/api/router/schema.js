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
    if (permissions.has(this.req.user, companyId) && projectId) {
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
        status: true
      });
    } catch (e) {
      console.error(e);
    }
    this.body = result;
  }
});

router.get('/schema/:schemaId', function* () {
    var schemaId = this.params.schemaId;
    if (permissions.has(this.req.user, this.req.user.companyId) && schemaId) {
      var schema = yield QowSchemas.findOne({where:{id : schemaId}});
      this.body = schema.dataValues;
    }
})
router.delete('/schema/:schemaId', function* () {
  var companyId = this.req.user.companyId;
  var schemaId = this.params.schemaId;
  if (permissions.has(this.req.user, companyId) && schemaId) {
    var targetSchema = yield QowSchemas.find({where: {id: schemaId}})
    yield targetSchema.update({status : !targetSchema.status})
    this.body = targetSchema;
  }
})

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
    console.log("get schema /id", vals);
    this.body = vals;
    }
  });

  router.post('/schemaField/:schemaId', function* () {
    var body = this.request.body;
    var schemaId = this.params.schemaId;
    if (permissions.has(this.req.user, this.req.user.companyId)) {
      var schema = yield QowSchemas.findOne({ id: schemaId });
      if(schema){
        var field = {
          name: body.name,
          required: body.required,
          qowSchemaId: schemaId,
          version: 1,
          type: body.type,
          status: true
        };
        this.body = yield QowFields.create(field);
      }
    }
  });
  router.patch('/schemaField/', function* () {
    var body = this.request.body;
    var fieldId = body.id;
    if (permissions.has(this.req.user, this.req.user.companyId) && fieldId) {
      try {
        var changes = {};
        var originalField = yield QowFields.findOne( {
          where: {
            id: fieldId
           }
        });
        originalField = originalField.dataValues;
        for (var key in body) {
          if(body[key] !== originalField[key]) {
            console.log(changes[key], body[key]);
            changes[key] = body[key];
          }
        }
        this.body = yield QowFields.update(changes, {
          where: {
            id: fieldId
          }
        });
        console.log("changes", changes);
      } catch (e) {
        console.error(e);
      }
    }
  });

  router.delete('/schemaField/:schemaFieldId', function* () {
    if (permissions.has(this.req.user, this.req.user.companyId)) {
      var body     = this.request.body;
      var schemaFieldId = this.params.schemaFieldId;
      this.body = yield QowFields.update({status: false}, {where : {id:schemaFieldId} });
      console.log(this.body);
    }
  });

  router.put('/schemaField/:schemaId', function* () {
    try{
      var schemaId = this.params.schemaId;
      var body    = this.request.body;
      var name    = body.name;
      var type    = body.type;
      var status  = body.status || true;
      var required= body.required || true;
      if (permissions.has(this.req.user, this.req.user.companyId)) {
        var field = {
          qowSchemaId: schemaId,
          type: type,
          required: required,
          version: 1,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          status: status
        };
        var targetSchema = yield QowSchemas.findOne({ id : schemaId});
        if (!targetSchema){
          throw(404);
        }
        this.body = yield QowFields.create(field);
      }
  } catch(err) {
    console.error(err);
    }
  });
app.use(router.routes());

module.exports = app;
