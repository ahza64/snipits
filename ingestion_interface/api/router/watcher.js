// Modules
const koa = require('koa');
const router = require('koa-router')();

// App
const app = koa();

// Collection
const Watchers = require('dsp_shared/database/model/ingestion/tables').ingestion_watchers;
const Ingestions = require('dsp_shared/database/model/ingestion/tables').ingestion_files;

// Create watchers
router.post(
  '/watchers',
  function*() {
    var body = this.request.body;
    var watcherEmails = body.watcherEmails;
    var companyId = body.companyId;
    var fileName = body.fileName;
    try {
      var ingestion = yield Ingestions.findOne({
        where: { customerFileName: fileName, companyId: companyId },
        raw: true
      });
      var ingestionId = ingestion.ingestionConfigurationId;

      if (ingestionId) {
        var existingWatchers = yield Watchers.findAll({
          where: { ingestionConfigurationId: ingestionId },
          raw: true
        });

        // Delete existing watchers
        if (existingWatchers.length) {
          yield Watchers.destroy({
            where: { ingestionConfigurationId: ingestionId },
            force: true
          });
        }

        // Create new watchers
        var objs = [];
        watcherEmails.forEach(email => {
          objs.push({
            email: email,
            companyId: companyId,
            ingestionConfigurationId: ingestionId
          });
        });

        yield Watchers.bulkCreate(objs);
      }
    } catch(e) {
      console.error(e);
      this.throw(500);
    }
    
    this.throw(200);
  }
);

// Get list of watchers based on file name
router.get(
  '/watchers/:fileName',
  function*() {
    var fileName = this.params.fileName;
    try {
      var ingestion = yield Ingestions.findOne({
        where: { fileName: fileName },
        raw: true
      });
      var ingestionId = ingestion.id;
      var watchers = yield Watchers.findAll({
        include: [
          {
            model: Ingestions,
            where: { id: ingestionId }
          } 
        ],
        raw: true
      });
    } catch(e) {
      console.error(e);
      this.throw(500);
    }

    if (!watchers) {
      this.body = [];
    } else if (!Array.isArray(watchers)) {
      watchers = [watchers];
      this.body = watchers.map(x => x.watchEmail);
    } else {
      this.body = watchers.map(x => x.watchEmail);
    }
  }
);

app.use(router.routes());

module.exports = app;
