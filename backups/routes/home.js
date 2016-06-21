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

router.get('/:id', function *(next){  
  if(this.params.id === performer){
  	var currStatus = yield backupStatus.find({ performer: performer }, { completed:1 }).exec();
  	if(currStatus[0].completed){
  		yield backupStatus.update({performer: performer}, { $set: {
  			completed: false, 
  			performer: performer
  		} }, { upsert: true });
      awsMethods.backup_now();
  		this.body = this.params.id;
    }
  	else{
  		this.body = 'previous backup is still running';
  	}
  }
  else{
  	this.body = 'need correct hash';
  }
  yield next;
});

app
  .use(router.routes())
  .use(router.allowedMethods());

module.exports = app;
