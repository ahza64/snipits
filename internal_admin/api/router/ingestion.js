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

// Set ingestion notification
router.put(
  '/ingestions',
  function*() {
    var body = this.request.body;
    var updateObj = {
      fileName: body.fileName,
      ingested: body.ingested,
      companyId: body.companyId
    };

    try {
      yield Ingestions.update(
        updateObj,
        {
          fields: ['ingested'],
          where: { fileName: body.fileName, companyId: body.companyId }
        }
      );
    } catch(e) {
      console.error(e);
      this.throw(500);
    }

    this.body = updateObj;
  }
);

app.use(router.routes());

module.exports = app;