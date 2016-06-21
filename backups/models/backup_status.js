/**
 * @fileOverview contains the backup status model to make it persistance and cannot be run until the previous backup has completed
 */

var mongoose = require('mongoose');

var backupStatusSchema = new mongoose.Schema({
  //_id
  performer :{ type: String },
  completed :{ type: Boolean },
  created_at : { type: Date },
  updated_at : { type: Date }
});

backupStatusSchema.pre('save', function(next){
  var now = new Date();
  this.updated_at = now;
  if ( !this.created_at ) {
    this.created_at = now;
  }
  next();
});

backupStatusSchema.pre('update', function(next){
  var now = new Date();
  this.update({},{ $set: { updated_at: now } });
  next()
});

module.exports = mongoose.model('BACKUPSTATUS', backupStatusSchema);