// Modules
const koa = require('koa');
const router = require('koa-router')();
const notifications = require('./notifications');

// App
const app = koa();

// Collection
const Ingestions = require('dsp_shared/database/model/ingestion/tables').ingestion_files;
const Company = require('dsp_shared/database/model/ingestion/tables').companies;
const WorkProjects = require('dsp_shared/database/model/ingestion/tables').work_projects;
const IngestionConfigurations = require('dsp_shared/database/model/ingestion/tables').ingestion_configurations;
const Admins = require('dsp_shared/database/model/ingestion/tables').dispatchr_admins;
const Histories = require('dsp_shared/database/model/ingestion/tables').ingestion_histories;

// Set ingestion notification
router.put(
  '/ingestions',
  function*() {
    var body = this.request.body;
		var ingestionId = body.ingestionId;
		delete body.ingestionId;

    try {
      yield Ingestions.update(body,
        {
          fields: ['ingested', 'description'],
          where: { id: ingestionId }
        }
      );
      if (body.ingested) {
        yield notifications.fileIngested(this.req.user, ingestionId);
      }
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
        include: [ Company, { model: IngestionConfigurations, include: [WorkProjects]}]
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
    var action = body.action;

    // Check whether the admin exists
    var admin = yield Admins.findOne({ where: { email: email }, raw: true });
    var adminId = admin.id;
    if (!adminId) { this.throw(403); }

    // Check whether the ingestion exists
    var ingestion = yield Ingestions.findOne({ where: { id: body.ingestionFileId }, raw: true });
    if (!ingestion.id) { this.throw(403); }

    var obj = {
      action: action,
      customerFileName: ingestion.customerFileName,
      adminName: admin.name,
      dispatchrAdminId: admin.id,
      companyId: ingestion.companyId,
      ingestionFileId: ingestion.id,
      ingestionConfigurationId: ingestion.ingestionConfigurationId
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
