// Module
const koa = require('koa');
const router = require('koa-router')();
const _ = require('underscore');
const s3 = require('dsp_shared/aws/s3');
const config = require('dsp_shared/conf.d/config.json').mooncake;
const notifications = require('./notifications');
const permissions = require('./permissions');
const s3Prefix = config.env + '.';

// Collection
const Histories = require('dsp_shared/database/model/ingestion/tables').ingestion_histories;
const Users = require('dsp_shared/database/model/ingestion/tables').users;
const Ingestions = require('dsp_shared/database/model/ingestion/tables').ingestion_files;
const Companies = require('dsp_shared/database/model/ingestion/tables').companies;
const Configs = require('dsp_shared/database/model/ingestion/tables').ingestion_configurations;

// App
const app = koa();

// Check if same file exists
router.get(
  '/check/same/:configId/:fileName',
  function*() {
    var configId = this.params.configId;
    var fileName = this.params.fileName;

    var config = null;
    try {
      config = yield Configs.findOne({
        where: { id: configId },
        raw: true
      });
    } catch(e) {
      console.error(e);
      this.throw(500);
    }
    if (!(config && permissions.has(this.req.user, config.companyId))) {
      this.throw(403);
    }

    var ingestions = [];
    try {
      ingestions = yield Ingestions.findAll({
        where: { ingestionConfigurationId: configId },
        raw: true
      });
    } catch(e) {
      console.error(e);
      this.throw(500);
    }

    ingestions = ingestions.map(x => x.customerFileName);
    var exists = _.contains(ingestions, fileName);

    this.body = exists;
  }
);

// Get the s3 signature
router.post(
  '/s3auth',
  function*() {
    var body = this.request.body;
    var companyId = body.companyId;

    if (!permissions.has(this.req.user, companyId)) {
      this.throw(403);
    }

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

var addToHistory = function*(file, user, action) {
  var obj = {
    action: action,
    s3FileName: file.s3FileName,
    customerFileName: file.customerFileName,
    userName: user.name,
    userId: user.id,
    companyId: file.companyId,
    ingestionFileId: file.id,
    ingestionConfigurationId: file.ingestionConfigurationId
  };
  return yield Histories.create(obj);
};

// Delete the uploaded file
router.post(
  '/delete',
  function*() {
    var fileId = this.request.body.fileId;
    var file = null;
    try {
      file = yield Ingestions.findOne({
        where: { id: fileId },
        raw: true
      });
    } catch(e) {
      console.error(e);
      this.throw(500);
    }

    if (!(file && permissions.has(this.req.user, file.companyId))) {
      this.throw(403);
    }

    try {
      var company = yield Companies.findOne({
        where: { id: file.companyId },
        raw: true
      });
      var bucketName = s3Prefix + company.name.toLowerCase() + '.ftp';
      var fileName = file.s3FileName;
      yield addToHistory(file, this.req.user, 'delete');
      yield notifications.send(this.req.user, file, 'delete');
      yield s3.delete(bucketName, [fileName]);
      yield Ingestions.destroy({
        where: {
          id: fileId
        },
        force: true
      });
      console.log('Deleted file ' + fileName + ' from ' + bucketName);
    } catch(e) {
      console.error(e);
      this.throw(500);
    }

    this.throw(200);
  }
);

app.use(router.routes());

module.exports = app;
