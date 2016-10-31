// Modules
const koa = require('koa');
const router = require('koa-router')();

// App
const app = koa();

// Collection
const Ingestions = require('dsp_shared/database/model/ingestion/tables').ingestions;

// Set ingestion notification
router.put(
  '/ingestions',
  function*() {
    var body = this.request.body;
    var updateObj = { ingested: true};

    try {
      yield Ingestions.update(
        updateObj,
        {
          fields: ['ingested'],
          where: { id: body.ingestionsId }
        }
      );
    } catch(e) {
      console.error(e);
      this.throw(500);
    }

    this.throw(200);
  }
);

// Get ingestion records
router.get(
  '/ingestions/:companyId',
  function*() {
    var companyId = this.params.companyId;
    if (!companyId) {
      return this.body = [];
    }

    try {
      var ingestions = yield Ingestions.findAll({
        where: { companyId: companyId },
        raw: true
      });
    } catch(e) {
      console.error(e);
      this.throw(500);
    }

    this.body = ingestions;
  }
);

app.use(router.routes());

module.exports = app;