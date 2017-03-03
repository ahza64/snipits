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
const QowExpectedTaxonomies = require('dsp_shared/database/model/ingestion/tables').qow_expected_taxonomies;

var updateFieldValues = function*(taxonomy, fieldValues) {
  console.log("/////////////// fieldValues", fieldValues);
  for ( var i=0; i<fieldValues.length; i++) {
    yield QowExpectedTaxonomies.create({
      fieldValue: fieldValues[i]
    });
  }
};

// Get all schema taxonomies
router.get(
  '/taxonomies/:schemaId',
  function*() {
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

router.delete(
  '/taxonomies/:taxonomyId',
  function*() {
    var taxonomyId = this.params.taxonomyId;
    if (permissions.has(this.req.user, null)) {
      try {
        this.body = yield QowTaxonomies.destroy({ where: { id: taxonomyId } });
      } catch (e) {
        console.error(e);
        this.throw(500);
      }
    } else {
      this.throw(403);
    }
  }
)

//create or edit a taxonomy
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
  var taxId = body.id;
  var taxonomy;

  if (permissions.has(this.req.user, companyId)) {
    try {
      console.log("----------------", this.request.body);
      if (taxId) {
        taxonomy = yield QowTaxonomies.find({ where: { id: taxId } });
        taxonomy = yield taxonomy.updateAttributes({
          fieldName: field_name,
          qowSchemaId: schemaId,
          order: order,
          nodeType: node_type,
          keys: keys
        });
      } else {
        taxonomy = yield QowTaxonomies.create({
          fieldName: field_name,
          qowSchemaId: schemaId,
          order: order,
          nodeType: node_type,
          keys: keys,
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
      }
      yield updateFieldValues(taxonomy, fieldValues)
    } catch (e) {
      console.error(e);
    }
    this.body = taxonomy;
  }
});

app.use(router.routes());

module.exports = app;
