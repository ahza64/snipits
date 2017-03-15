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

// Get all schema taxonomies
router.get(
  '/taxonomies/:schemaId',
  function*() {
    var companyId = this.req.user.companyId;
    var schemaId = this.params.schemaId;
    if (permissions.has(this.req.user, companyId) && schemaId) {
      var schemaTaxonomies = yield QowTaxonomies.findAll({
        where: {
          qowSchemaId: schemaId
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
    var companyUserId = this.req.user.companyId;
    var body = this.request.body;
    var taxId = body.id;
    var taxonomy;

    if (permissions.has(this.req.user, companyUserId)) {
      try {
        if (taxId) {
          taxonomy = yield QowTaxonomies.find({ where: { id: taxId } });
          taxonomy = yield taxonomy.updateAttributes(body);
        } else {
          body.createdAt = Date.now();
          body.updatedAt = Date.now();
          taxonomy = yield QowTaxonomies.create(body);
        }
        // yield updateFieldValues(taxonomy, fieldValues) TODO update expected tax fieldName when tax fieldName changes
      } catch (e) {
        console.error(e);
      }
      this.body = taxonomy;
    }
  }
);

router.get(
  '/taxfields/:taxName',
  function*() {
    var companyId = this.req.user.companyId;
    var fieldName = this.params.taxName;
    if (permissions.has(this.req.user, companyId) && fieldName) {
      var expectedTaxonomies = yield QowExpectedTaxonomies.findAll({
        where: {
          fieldName: fieldName
        },
        raw: true
      })
      this.body = expectedTaxonomies;
    }
  }
)

router.post(
  '/taxfields/',
  function*() {
    var body = this.request.body;
    var taxValId = body.id;
    var companyUserId = this.req.user.companyId;
    var taxValue;
    
    if (permissions.has(this.req.user, companyUserId)) {
      try {
        if (taxValId) {
          taxValue = yield QowExpectedTaxonomies.find({ where: { id: taxValId } });
          taxValue = yield taxValue.updateAttributes(body);
        } else {
          taxValue = yield QowExpectedTaxonomies.create(body);
        }
      } catch (err) {
        console.error(err);
      }
      this.body = taxValue;
    }
  }
);

app.use(router.routes());

module.exports = app;
