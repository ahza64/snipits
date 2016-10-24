// Modules
const koa = require('koa');
const router = require('koa-router')();

// App
const app = koa();

// Collection
const Ingestions = require('dsp_shared/database/model/ingestion/tables').ingestions;

// Set ingestion / ingested notification
router.put(
  '/ingestions',
  function*() {
    var body = this.request.body;
    var updateObj = {
      notified: body.notified,
      ingested: body.ingested
    }; 

    try {
      yield Ingestions.update(
        updateObj,
        {
          fields: ['notified', 'ingested'],
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

app.use(router.routes());

module.exports = app;