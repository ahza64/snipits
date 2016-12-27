// Module
const koa = require('koa');
const router = require('koa-router')();
const _ = require('underscore');
const s3 = require('dsp_shared/aws/s3');
const config = require('dsp_shared/conf.d/config.json').mooncake;
const notifications = require('./notifications');
const s3Prefix = config.env + '.';

// Collection
const Histories = require('dsp_shared/database/model/ingestion/tables').ingestion_histories;
const Users = require('dsp_shared/database/model/ingestion/tables').users;
const Ingestions = require('dsp_shared/database/model/ingestion/tables').ingestion_files;
const Companies = require('dsp_shared/database/model/ingestion/tables').companies;

// App
const app = koa();

// Get the uploaded files
router.get(
  '/displayUpload/:company',
  function*() {
    var company = this.params.company;
    var bucket = s3Prefix + company.toLowerCase() + '.ftp';
    try {
      var res = yield s3.list(bucket);
      var files = res.Contents;

      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var fileName = file.Key;
        var ingestion = yield Ingestions.findOne({
          where: {
            fileName: fileName
          },
          raw: true
        });
        file.ingestion = ingestion;
      }
    } catch(e) {
      console.error(e);
      this.throw(500);
    }

    console.log('Files already uploaded: ', files);
    this.body = files;
  }
);

// Check if same file exists
router.get(
  '/check/same/:configId/:fileName',
  function*() {
    var configId = this.params.configId;
    var fileName = this.params.fileName;

    try {
      var ingestions = yield Ingestions.findAll({
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
    var fileName = this.request.body.name;
    var fileType = this.request.body.type;
    var company = this.request.body.company.toLowerCase();
    var action = this.request.body.action;
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

    try {
      var file = yield Ingestions.findOne({
        where: { id: fileId },
        raw: true
      });
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
