/**
 * @fileOverview Utils for S3 bucket
 */

// Load the SDK
const fs = require('fs');
const co = require('co');
const BPromise = require('bluebird');
const AWS = require('aws-sdk');

// Create an S3 client
var s3 = new AWS.S3();
s3.createBucketAsync = BPromise.promisify(s3.createBucket);
s3.deleteBucketAsync = BPromise.promisify(s3.deleteBucket);
s3.putObjectAsync = BPromise.promisify(s3.putObject);
s3.getObjectAsync = BPromise.promisify(s3.getObject);
fs.writeFileAsync = BPromise.promisify(fs.writeFile);
s3.deleteObjectsAsync = BPromise.promisify(s3.deleteObjects);
s3.listObjectsAsync = BPromise.promisify(s3.listObjectsV2);
s3.getSignedUrlAsync = BPromise.promisify(s3.getSignedUrl);
s3.putBucketCorsAsync = BPromise.promisify(s3.putBucketCors);
s3.copyObjectAsync = BPromise.promisify(s3.copyObject);

module.exports = {
  createBucket: co.wrap(function* (bucketName) {
    var params1 = {
      Bucket: bucketName,
      CreateBucketConfiguration: { LocationConstraint: 'us-west-2' },
    };

    var params2 = {
      Bucket: bucketName,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedMethods: [
              'GET',
              'POST',
              'PUT',
              'DELETE'
            ],
            AllowedOrigins: [ '*' ],
            AllowedHeaders: [ '*' ],
          }
        ]
      }
    };

    try {
      yield s3.createBucketAsync(params1);
      yield s3.putBucketCorsAsync(params2);
      console.log('Successfully created bucket ' + bucketName);
    } catch(e) {
      console.error(e);
    }
  }),

  deleteBucket: co.wrap(function* (bucketName) {
    var params = { Bucket: bucketName };

    try {
      yield s3.deleteBucketAsync(params);
      console.log('Successfully deleted bucket ' + bucketName);
    } catch(e) {
      console.error(e);
    }
  }),

  upload: co.wrap(function* (bucketName, fileName, file) {
    var params = { Bucket: bucketName, Key: fileName, Body: file };

    try {
      yield s3.putObjectAsync(params);
      console.log('Successfully uploaded data to ' + bucketName + '/' + fileName);
    } catch(e) {
      console.error(e);
    }
  }),

  download: co.wrap(function* (bucketName, fileName, fileDir) {
    var params = { Bucket: bucketName, Key: fileName };

    try {
      var data = yield s3.getObjectAsync(params);
      data = data.Body.toString('utf-8');
      yield fs.writeFileAsync(fileDir + fileName, data);
      console.log('Successfully download data from ' + bucketName + '/' + fileName);
    } catch(e) {
      console.error(e);
    }
  }),

  copy: co.wrap(function* (bucketName, sourceFileName, targetFileName) {
    var params = {
      Bucket: bucketName,
      CopySource: bucketName + '/' + sourceFileName,
      Key: targetFileName
    };

    try {
      yield s3.copyObjectAsync(params);
      console.log('Successfully copy data from ' + sourceFileName + ' to ' + targetFileName);
    } catch(e) {
      console.error(e);
    }
  }),

  delete: co.wrap(function* (bucketName, fileNames) {
    var params = {
      Bucket: bucketName,
      Delete: { Objects: [] }
    };

    fileNames.forEach(f => {
      params.Delete.Objects.push({ Key: f });
    });

    try {
      yield s3.deleteObjectsAsync(params);
      console.log('Successfully deleted data from ' + bucketName + '/' + fileNames);
    } catch(e) {
      console.error(e);
    }
  }),

  list: co.wrap(function* (bucketName) {
    var params = { Bucket: bucketName };

    try {
      var objs = yield s3.listObjectsAsync(params);
      console.log('Successfully display data from ' + bucketName);
      return objs;
    } catch(e) {
      console.error(e);
    }
  }),

  sign: co.wrap(function* (action, bucketName, fileName, fileType) {
    var params = {
      Bucket: bucketName,
      Key: fileName,
      Expires: 3000,
      ContentType: fileType
    };

    try {
      var signedUrl = yield s3.getSignedUrlAsync(action, params);
      return signedUrl;
    } catch(e) {
      console.error(e);
    }
  }),
};