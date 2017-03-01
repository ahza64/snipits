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
const QowTaxonomies = require('dsp_shared/database/model/ingestion/tables').qow_taxonomies;

// Get all schema taxonomies
router.get(
  '/taxonomies/:schemaId',
  function*() {
    console.log("taxonomies endpoint hit{{{{{{{{{{{}}}}}}}}}}}");
    var companyId = this.req.user.companyId;
    var schemaId = this.params.schemaId;
    var self = this;
    if (permissions.has(this.req.user, companyId) && schemaId) {
      var schemaTaxonomies = yield QowTaxonomies.findAll({
        where: {
          qowSchemaId: schemaId,
         },
        raw: true
      })
      this.body = schemaTaxonomies;
    }
  }
);

//create a new taxonomy
router.post(
  '/taxonomies',
  function*() {
  var companyId = this.req.user.companyId;
  var body = this.request.body;
  var field_name = body.fieldName;
  var schemaId = body.schemaId;
  var order = body.order;
  var node_type = body.nodeType;
  var keys = body.keys;
  var taxId = body.id
  var result;

  if (permissions.has(this.req.user, companyId)) {
    try {
      if (taxId) {
        taxonomy = yield QowTaxonomies.find({ where: { id: taxId } });
        result = yield taxonomy.updateAttributes({
          fieldName: field_name,
          qowSchemaId: schemaId,
          order: order,
          nodeType: node_type,
          keys: keys
        });
      } else {
        console.log("----------------", this.request.body);
        result = yield QowTaxonomies.create({
          fieldName: field_name,
          qowSchemaId: schemaId,
          order: order,
          nodeType: node_type,
          keys: keys,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
    } catch (e) {
      console.error(e);
    }
    this.body = result;
  }
});

app.use(router.routes());

module.exports = app;
