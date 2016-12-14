// Modules
const koa = require('koa');
const router = require('koa-router')();

// App
const app = koa();

// Collection
const sequelize = require('dsp_shared/database/model/ingestion/tables').sequelize;
const Ingestions = require('dsp_shared/database/model/ingestion/tables').ingestion_files;

// Create a file record for ingestions
router.post(
  '/ingestions',
  function*() {
    var body = this.request.body;
    var record = {
      customerFileName: body.fileName,
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
    var fileName = body.customerFileName;

    try {
      yield Ingestions.update(
        {
          description: description
        },
        {
          fields: [ 'description' ],
          where: {
            customerFileName: fileName,
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

// Get the total number of the record
router.get(
  '/ingestions/total/:companyId',
  function*() {
    var companyId = this.params.companyId;

    try {
      var total = yield Ingestions.count({
        where: { companyId: companyId }
      });
    } catch(e) {
      console.error(e);
      this.throw(500);
    }

    this.body = total;
  }
);

// Get all ingestion record
router.get(
  '/ingestions/all/:companyId/:offset',
  function*() {
    var companyId = this.params.companyId;
    var offset = this.params.offset;

    try {
      var ingestions = yield Ingestions.findAll({
        limit: 5,
        offset: offset,
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

// Get the ingestion record
router.get(
  '/ingestions/:fileName/:companyId',
  function*() {
    var fileName = this.params.fileName;
    var companyId = this.params.companyId;

    try {
      var ingestion = yield Ingestions.findOne({
        where: {
          customerFileName: fileName,
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

// Search the ingestion record
router.get(
  '/searchingestions/:companyId/:token',
  function*() {
    var companyId = this.params.companyId;
    var token = this.params.token;

    try {
      var res = yield sequelize.query(
        'SELECT * FROM ingestions INNER JOIN companies ' +
        'ON ingestions."companyId" = companies.id ' +
        'WHERE ingestions."customerFileName" LIKE \'%' + token + '%\' ' +
        'AND companies.id = ' + companyId + ';'
      );
    } catch(e) {
      console.error(e);
      this.throw(500);
    }

    this.body = res[0];
  }
);

app.use(router.routes());

module.exports = app;
