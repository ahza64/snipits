// Modules
const koa = require('koa');
const router = require('koa-router')();

// App
const app = koa();

// Collection
const Ingestions = require('dsp_shared/database/model/ingestion/tables').ingestions;
const Admins = require('dsp_shared/database/model/ingestion/tables').admins;

// Create a file record for ingestions
router.post(
  '/ingestions',
  function*() {
    var body = this.request.body;
    var record = {
      fileName: body.fileName,
      notified: false,
      ingested: false,
      ingestEmail: body.ingestEmail,
      companyId: body.companyId
    };

    try {
      yield Ingestions.create(record);
    } catch(e) {
      console.error(e);
      this.throw(500);
    }
    
    this.throw(200);
  }
);

// Set ingestion / ingested notification
router.put(
  '/ingestions',
  function*() {
    var body = this.request.body;
    var updateObj = {
      fileName: body.fileName,
      notified: body.notified,
      ingested: body.ingested,
      ingestEmail: body.ingestEmail,
      companyId: body.companyId
    };

    try {
      yield Ingestions.update(
        updateObj,
        {
          fields: ['notified', 'ingested', 'ingestEmail', 'companyId'],
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

// Get ingestors' email
router.get(
  '/ingestions',
  function*() {
    try {
      var ingestors = yield Admins.find({ where: { status: 'active' }, raw: true });
    } catch(e) {
      console.error(e);
    }

    if (Array.isArray(ingestors)) {
      this.body = ingestors;
    } else {
      this.body = [ingestors];
    }
  }
);

app.use(router.routes());

module.exports = app;