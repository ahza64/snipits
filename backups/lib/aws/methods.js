/**
 * AWS contains aws specific methods and functions
 */
var AWS = require( 'aws-sdk' );
var s3 = new AWS.S3();
var spawn = require('child_process').spawn;
var backupStatus = require('../../models/backup_status');
var co = require('co');
var performer = '6d88c16f19a7874c5d6c82f99b532a15';
/**
 * list_files list all buckets from s3
 * @return {void} void
 */
function list_files(){
  s3.listBuckets(function(err, data) {
    if (err) { console.log("Error:", err); }
    else {
        for (var index in data.Buckets) {
              var bucket = data.Buckets[index];
              console.log("Bucket: ", bucket.Name, ' : ', bucket.CreationDate);
            }
      }
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
  list: list_files,
  restore_from_backup: restore_from_backup,
  backup_now: backup_now
};
