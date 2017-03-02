
const koa = require('koa');
const router = require('koa-router')();
const s3 = require('dsp_shared/aws/s3');

const config = require('dsp_shared/conf.d/config.json').admin;
const s3Prefix = config.env + '.';


const Companies = require('dsp_shared/database/model/ingestion/tables').companies;

const app = koa();

router.post(
  '/s3auth',
  function*() {
    var body = this.request.body;
    var companyId = body.companyId;

    var company = null;
    try {
      var c = yield Companies.findOne({
        where: { id: companyId },
        raw: true
      });
      company = c.name;
    } catch(e) {
      console.error(e);
      this.throw(500);
    }

    if (!company) {
      this.throw(500);
    }

    var fileName = body.name;
    var fileType = body.type;

    var action = body.action;
    var bucket = s3Prefix + company + '.ftp';

    try {
      yield s3.list(bucket);
      var signedUrl = yield s3.sign(action, bucket, fileName, fileType);
    } catch(e) {
      console.error(e);
      this.throw(500);
    }

    this.body = signedUrl;
  }
);

app.use(router.routes());

module.exports = app;
