// Module
const koa = require('koa');
const router = require('koa-router')();
const s3 = require('dsp_shared/aws/s3');

// App
const app = koa();

// Get the uploaded files
router.get('/displayUpload/:company', function*() {
  var company = this.params.company;
  var bucket = company.toLowerCase() + '.ftp';
  var res = yield s3.list(bucket);
  var files = res.Contents;
  console.log('Files already uploaded: ', files);
  this.body = files;
});

// Get the s3 signature
router.post('/s3auth', function*() {
  var fileName = this.request.body.name;
  var fileType = this.request.body.type;
  var company = this.request.body.company.toLowerCase();
  var signedUrl = yield s3.sign('putObject', company + '.ftp', fileName, fileType);
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

app.use(router.routes());

module.exports = app;