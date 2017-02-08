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
  }
);

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
      var created;
      var version = found ? found.version : 0;

      if(err){
        console.error(err);
      }

      try {
        created = QowSchemas.create({
          name: name,
          workProjectId: projectId,
          version: version + 1,
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
        self.body =  created;
      } catch (e) {
        console.error(e);
      }
    }); //then(found,err)
  } //if
});

router.get('/schema/:schemaId',function* () {
  var companyId = this.req.user.companyId;
  var schemaId = this.params.schemaId;
  var self = this;
  if (permissions.has(this.req.user, companyId)) {
    yield QowFields.findAll({
      where : {
        qowSchemaId : schemaId
      }
    }).then((res, err)=>{
      console.log(res);
      self.body = res;
    })
  }
})

app.use(router.routes());

module.exports = app;
