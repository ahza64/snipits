// Modules
const koa = require('koa');
const router = require('koa-router')();

// App
const app = koa();

// Collection
const Ingestions = require('dsp_shared/database/model/ingestion/tables').ingestions;
const Admins = require('dsp_shared/database/model/ingestion/tables').admins;
const Histories = require('dsp_shared/database/model/ingestion/tables').histories;

// Set ingestion notification
router.put(
  '/ingestions',
  function*() {
    var body = this.request.body;

    try {
      yield Ingestions.update(
        { ingested: true },
        {
          fields: ['ingested'],
          where: { id: body.ingestionId }
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

// Upload/Delete/Ingest history
router.post(
  '/history',
  function*() {
    var body = this.request.body;
    var email = body.email;
    var fileName = body.file;
    var action = body.action;

    // Check whether the admin exists
    var admin = yield Admins.findOne({ where: { email: email }, raw: true });
    var adminId = admin.id;
    if (!adminId) { this.throw(403); }

    var obj = {
      fileName: fileName,
      action: action,
      time: new Date(),
      adminId: adminId
    };
    try {
      yield Histories.create(obj);  
    } catch (e) {
      console.error(e);
      this.throw(500);
    }
    
    this.throw(200);
  }
);

app.use(router.routes());

module.exports = app;