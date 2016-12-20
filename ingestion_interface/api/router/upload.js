// Module
const koa = require('koa');
const router = require('koa-router')();
const _ = require('underscore');
const s3 = require('dsp_shared/aws/s3');
const config = require('dsp_shared/conf.d/config.json').mooncake;
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

// Delete the uploaded file
router.post(
  '/delete',
  function*() {
    var company = this.request.body.company;
    var fileName = this.request.body.file;
    var bucketName = s3Prefix + company.toLowerCase() + '.ftp';

    try {
      var companyId = yield Companies.findOne({
        where: { name: company },
        raw: true
      });
      companyId = companyId.id;
      yield s3.delete(bucketName, [fileName]);
      yield Ingestions.destroy({
        where: {
          customerFileName: fileName,
          companyId: companyId
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
