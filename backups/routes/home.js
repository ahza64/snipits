/**
 * @fileOverview Contains the landing page for backups page
 */

var koa = require('koa');
var router = require('koa-router')();
var app = koa();
var awsMethods = require('../lib/aws/methods');
var backupStatus = require('../models/backup_status');
//aws_methods.list();
//aws_methods.restore_from_backup();


var performer = '6d88c16f19a7874c5d6c82f99b532a15';


router.get('/query', function *(next){  
  console.log("in query path");
  var query = this.request.query;
  if(!query.bucket){
    this.body = { error: 'no bucket field inserted' };
    this.status = 404;
  }
  //list all objects in the bucket
  else {
    var files = yield awsMethods.list_files(query.bucket);
    this.body = files;
    yield next;
  }  
});



router.get('/', function *(next){  
  console.log("in root path");
  var buckets = yield awsMethods.list();
  console.log(buckets);
  this.body = buckets;
  yield next;
});

app
  .use(router.routes())
  .use(router.allowedMethods());

module.exports = app;
