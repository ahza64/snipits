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
    var companyId = this.req.user.companyId;
    var schemaId = this.params.schemaId;
    var self = this;
    if (permissions.has(this.req.user, companyId) && schemaId) {
      var schemaTaxonomies = yield QowTaxonomies.findAll({
        where: {
          schemaId: schemaId,
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
  var field_name = body.name;
  var schemaId = body.id;
  var order = body.order;
  var node_type = body.node_type;
  var keys = body.keys;
  var result;

  if (permissions.has(this.req.user, companyId) && schemaId) {
    try {
      result = yield QowTaxonomies.create({
        field_name: name,
        schemaId: schemaId,
        order: order,
        node_type: node_type,
        keys: keys,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    } catch (e) {
      console.error(e);
    }
    this.body = result;
  }
});

app.use(router.routes());

module.exports = app;
