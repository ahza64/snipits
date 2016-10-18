// Module
const fs = require('fs');
const path = require('path');
const os = require('os');
const koa = require('koa');
const router = require('koa-router')();
const parse = require('co-busboy');

// S3 Module
const config = require('../model/config').s3bucket;
const s3 = require('dsp_shared/aws/s3');
const s3auth = require('./s3auth');

// App
const app = koa();

// Constant
const uploadFileDir = path.join(os.homedir() + '/uploaded_files');

// Upload a file
router.post('/upload/:company', function*() {
  // Check if company folder exists
  // If not create one
  var company = this.params.company;
  var uploadFileCompDir = uploadFileDir + '/' + company;
  
  try {
    fs.accessSync(uploadFileCompDir);
  } catch (err) {
    fs.mkdirSync(uploadFileCompDir);
  }

  var files = [];
  var parts = parse(this);
  var part;

  while (part = yield parts) {
    var filename = part.filename;
    var stream = fs.createWriteStream(path.join(uploadFileCompDir, filename));
    part.pipe(stream);
    files.push(filename);
    console.log('uploading %s -> %s', part.filename, stream.path);
  }

  this.body = { files: files };
});

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
  var signedUrl = yield s3.sign('putObject', config.bucket, fileName, fileType);
  this.body = signedUrl;
});

app.use(router.routes());

module.exports = app;