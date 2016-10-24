// Module
const koa = require('koa');
const router = require('koa-router')();
const s3 = require('dsp_shared/aws/s3');

// Collection
const Histories = require('../model/tables').histories;
const Users = require('../model/tables').users;
const Ingestions = require('../model/tables').ingestions;

// App
const app = koa();

// Get the uploaded files
router.get('/displayUpload/:company', function*() {
  var company = this.params.company;
  var bucket = company.toLowerCase() + '.ftp';
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

  console.log('Files already uploaded: ', files);
  this.body = files;
});

// Get the s3 signature
router.post('/s3auth', function*() {
  var fileName = this.request.body.name;
  var fileType = this.request.body.type;
  var company = this.request.body.company.toLowerCase();
  var action = this.request.body.action;
  var signedUrl = yield s3.sign(action, company + '.ftp', fileName, fileType);
  this.body = signedUrl;
});

// Delete the uploaded file
router.post('/delete', function*() {
  var bucketName = this.request.body.company.toLowerCase() + '.ftp';
  var fileName = this.request.body.file;
  console.log('Deleted file ' + fileName + ' from ' + bucketName);
  yield s3.delete(bucketName, [fileName]);
  this.throw(200);
});

// Upload/Delete/Ingest history
router.post('/history', function*() {
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
});

app.use(router.routes());

module.exports = app;