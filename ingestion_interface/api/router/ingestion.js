// Modules
const koa = require('koa');
const router = require('koa-router')();

// App
const app = koa();

// Collection
const Ingestions = require('dsp_shared/database/model/ingestion/tables').ingestions;

// Create a file record for ingestions
router.post(
  '/ingestions',
  function*() {
    var body = this.request.body;
    var record = {
      fileName: body.fileName,
      description: '',
      ingested: false,
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

// Set the description for the ingestion
router.put(
  '/ingestions',
  function*() {
    var body = this.request.body;
    var description = body.description;
    var companyId = body.companyId;
    var fileName = body.fileName;

    try {
      yield Ingestions.update(
        {
          description: description
        },
        {
          fields: [ 'description' ],
          where: {
            fileName: fileName,
            companyId: companyId
          }
        }
      );
    } catch(e) {
      console.error(e);
      this.throw(500);
    }

    this.throw(200);
  }
);

// Get the ingestion record
router.get(
  '/ingestions/:fileName/:companyId',
  function*() {
    var fileName = this.params.fileName;
    var companyId = this.params.companyId;

    try {
      var ingestion = yield Ingestions.findOne({
        where: {
          fileName: fileName,
          companyId: companyId
        },
        raw: true
      });
    } catch(e) {
      console.error(e);
      this.throw(500);
    }

    this.body = ingestion;
  }
);

app.use(router.routes());

module.exports = app;