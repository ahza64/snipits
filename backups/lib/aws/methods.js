/**
 * AWS contains aws specific methods and functions
 */
var AWS = require( 'aws-sdk' );
var s3 = new AWS.S3();
var spawn = require('child_process').spawn;
var backupStatus = require('../../models/backup_status');
var co = require('co');
var Bpromise = require('bluebird');
var performer = '6d88c16f19a7874c5d6c82f99b532a15';
var _ = require('underscore');
/**
 * list_buckets list all buckets from s3
 * @return {void} void
 */
function list_buckets(){
  return new Bpromise(function(resolve, reject){
    s3.listBuckets(function(err, data) {
      if (err) { console.log("Error:", err);
                  reject(err); 
                }
      else {
          resolve(data.Buckets);
        }
      });
  });
}

/**
 * list_files lists all files in the bucket with a url 
 * @param  {string} bucket name of the bucket
 * @return {array}          array of files in the bucket with a url         
 */
function list_files(bucket){  
  return new Bpromise(function(resolve, reject){
      s3.listObjects({ 
        Bucket: bucket, 
        Delimiter: '/'
      }, function(err, data) {
      if (err) {
        console.log(err, err.stack); // an error occurred
        reject(err);
      } else {
        var data_with_url = _.map(data.Contents, key => {
          var params = {Bucket: 'bucket', Key: key.Key};
          var url = s3.getSignedUrl('getObject', params);
          return {
              Key: key.Key,
              LastModified: key.LastModified,
              Size: key.Size,
              URL: url
            };
        });
        resolve(data_with_url);
      }    
    });
  });
}

function backup_now(){
  var backupDb = spawn('sh', [ 'backup_now.sh' ]);
  backupDb.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
  });
  
  backupDb.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });
  
  backupDb.on('close', (code) => {
    co(function *(){
        yield backupStatus.update({ performer: performer }, { completed: true } ).exec();
    });
    console.log(`child process exited with code ${code}`);
  });
}

/**
 * restore_from_backup to local machine running the node server
 * @return {void} void
 */
function restore_from_backup(){
  
  var getdb = spawn('sh', [ 'get_database.sh' ]);
  getdb.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
  });
  
  getdb.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });
  
  getdb.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
}


module.exports = {
  list: list_buckets,
  list_files: list_files,
  restore_from_backup: restore_from_backup,
  backup_now: backup_now
};
