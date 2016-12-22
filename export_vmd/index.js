var config = require('dsp_shared/config/config').get();
require('sugar');
const utils = require('dsp_shared/lib/cmd_utils');
var validation = require("./validation");
var extraction = require("./extraction");
var mark_exported = require("./mark_exported");
var spawn = require('child-process-promise').spawn;
var assert = require('assert');
var moment = require('moment');
var path = require('path');

var s3 = require('dsp_shared/aws/s3');
var fs = require("fs");
var bluebird = require('bluebird');
fs.readdirAsync = bluebird.promisify(fs.readdir);
fs.openAsync = bluebird.promisify(fs.open);

var S3_BUCKET = config.pge_vmd_export.bucket;
var DISTRIBUTION_LIST = config.pge_vmd_export.distribution_list;

var gen_email = require('dsp_email/create_mail');

function *run(end_date, start_date) {
  end_date = santitizeDate(end_date || 'last saturday');
  start_date = santitizeDate(start_date || "2015-01-01T00:00:00.000Z");  
  
  console.log(start_date, end_date);
  yield validation.fixes();

  yield work_packet(start_date, end_date);
  yield work_complete(start_date, end_date);

  yield email(end_date); 
}

function santitizeDate(date) {
  if(typeof(date) === "string") {
    var tz_regex = /(?:Z|[+-](?:2[0-3]|[01][0-9]):[0-5][0-9])$/;
    var m = date.match(tz_regex);
    if(!m) { // no timezone
      date = Date.create(date);
      var local_offset = date.getTimezoneOffset();
      date.addMinutes(-1*local_offset);      
    } else {
      date = Date.create(date);
    }
  }
  return moment(date).utcOffset("+0000");
}

function *work_packet(start_date, end_date) {
  end_date = santitizeDate(end_date || 'last saturday');
  start_date = santitizeDate(start_date || "2015-01-01T00:00:00.000Z");  
  
  var dir = export_dir(end_date, "wp");
  yield extraction.run(start_date.toDate(), end_date.toDate(), false, undefined, path.basename(dir), undefined, false, false, true);
  yield tar(end_date, 'wp');
  yield upload(end_date, 'wp');
  yield mark_exported.run(dir, end_date);
}

function *work_complete(start_date, end_date) {
  end_date = santitizeDate(end_date || 'last saturday');
  start_date = santitizeDate(start_date || "2015-01-01T00:00:00.000Z");  
  
  var dir = export_dir(end_date, "wc");
  yield extraction.run(start_date.toDate(), end_date.toDate(), false, undefined, path.basename(dir), undefined, true, false, true);
  yield tar(end_date, 'wc');
  yield upload(end_date, 'wc');
  yield mark_exported.run(dir, end_date);
  
}


function *unset(date, type) {
  date = santitizeDate(date || 'last saturday');
  var file_date =  get_file_date(date);
  yield mark_exported.run(`vmd_export/${type}_${file_date}`, undefined, true);//unset
}

function get_file_date(date) {
  return date.utcOffset("+0000").format("YYYY-MM-DD_HH.mm.SS.000\\Z");
}

function export_dir(date, type) {
  var file_date = get_file_date(date);
  return `vmd_export/${type}_${file_date}`;
}

function tar_filename(date, type) {
  var file_date = get_file_date(date);
  return `vmd_${type}_export_${file_date}.tar.gz`;
}

/**
 * @description send export email
 */
function *email(date) {
  date = santitizeDate(date || 'last saturday');
  
  var types = ["wp", "wc"];
  var files = [];
  for(var i = 0; i < types.length; i++) {
    var type = types[i];
    var filename = tar_filename(date, type);
    var file_names =  yield fs.readdirAsync(export_dir(date, type));

    files.push({
      type: {wp: "WorkPacket", wc: "WorkComplete"}[type],
      name: filename,
      date: date.format("M/D/YYYY"),
      file_count: file_names.length,
      link: `http://file.dispatchr.co/${filename}`    
    });
  }
  
  var email_info = {
    end_date: date.format("M/D"), //moment format
    start_date: moment(date.toDate().rewind('1 week')).format("M/D"),//moment format
    files: files
  };
  
  return yield gen_email({
                            to: DISTRIBUTION_LIST,
                            from: 'Dispatchr <no-reply@dispatchr.com>',
                            replyTo: 'Gabriel Littman <gabe@dispatchr.com>',
                            template: 'vmd_export',
                            values: email_info
                        }, true);
}

/**
 * upload tar files to s3 where they are available for download 
 */
function *upload(date, type) {
  date = santitizeDate(date || 'last saturday');
  var filename = tar_filename(date, type);
  yield uploadFile(filename);
}

function *uploadFile(filename){
  var file = fs.createReadStream(filename);
  console.log("UPLOADING>>>>", filename);
  yield s3.upload(S3_BUCKET, filename, file);  
}

/**
 * tar and zip up files
 * @param {String} date 
 * @param {String} type the type of export "wp" (work packet) or "wc" Work Compelete
 */
function *tar(date, type) {
  var ouput_file = tar_filename(date, type);
  assert(!fs.existsSync(ouput_file), "Output File Exists: "+ouput_file);
  var t = spawn('tar', ['-zcvf', ouput_file, export_dir(date, type)]);
  console.log('[tar] pid: ', t.childProcess.pid);
  t.childProcess.stdout.on('data', function (data) {
      console.log('[tar] stdout: ', data.toString());
  });
  t.childProcess.stderr.on('data', function (data) {
      console.log('[tar] stderr: ', data.toString());
  });
  yield t;
}

//baker module
if (require.main === module) {
  var baker = require('dsp_shared/lib/baker');
  utils.bakerGen(run, { opts: 'params', default: true }); 
  utils.bakerGen(unset);
  utils.bakerGen(upload);
  utils.bakerGen(uploadFile);
  utils.bakerGen(email);
  utils.bakerGen(work_packet);
  utils.bakerGen(work_complete);    
  baker.run();  
}
