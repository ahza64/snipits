// Module
const koa = require('koa');
const router = require('koa-router')();
//const s3 = require('dsp_shared/aws/s3');
//const config = require('dsp_shared/conf.d/config.json').mooncake;
//const s3Prefix = config.env + '.';

// Collection
const Histories = require('dsp_shared/database/model/ingestion/tables').histories;
const Users = require('dsp_shared/database/model/ingestion/tables').users;
const Admins = require('dsp_shared/database/model/ingestion/tables').admins;

// App
const app = koa();

// Upload/Delete/Ingest history
router.post(
  '/history',
  function*() {
    var body = this.request.body;
    var email = body.email;
    var fileName = body.file;
    var action = body.action;

    // Check whether the user exists
    var user = yield Users.findOne({ where: { email: email }, raw: true });
    var userId = user.id;
    if (!userId) { this.throw(403); }

    var obj = {
      fileName: fileName,
      action: action,
      time: new Date(),
      userId: userId
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

// Get histories
router.get(
  '/history/:companyId',
  function*() {
    var companyId = this.params.companyId;

    try {
      var histories = yield Users.findAll({
        where: { companyId: companyId },
        include: [ Histories ],
        raw: true
      });

      histories = [
        ...histories,
        ...yield Admins.findAll({
          where: { companyId: companyId },
          include: [ Histories ],
          raw: true
        })
      ];
    } catch(e) {
      console.error(e);
      this.throw(500);
    }

    this.body = histories;
  }
);

app.use(router.routes());

module.exports = app;