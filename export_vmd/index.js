require('sugar');
const utils = require('dsp_shared/lib/cmd_utils');
var validation = require("./validation");
var extraction = require("./extraction");
var mark_exported = require("./mark_exported");
var spawn = require('child-process-promise').spawn;
var assert = require('assert');

var s3 = require('dsp_shared/aws/s3');
var fs = require("fs");
var bluebird = require('bluebird');
fs.readdirAsync = bluebird.promisify(fs.readdir);
fs.openAsync = bluebird.promisify(fs.open);

var S3_BUCKET = "prod.pge.ftp.export.vmd"; //"dev.pge.ftp.export.vmd"; 
var DISTRIBUTION_LIST = "vmd_export";

var gen_email = require('dsp_email/create_mail');

function *run(end_date, start_date) {
  end_date = santitizeDate(end_date || 'last saturday');
  start_date = santitizeDate(start_date || "2015-01-01T00:00:00.000Z");
  
  var file_date =  end_date.format("{yyyy}-{MM}-{dd}_{HH}.{mm}.{ss}.000Z");
  
  console.log(start_date, end_date, file_date);
  yield validation.fixes();

  // work packet export
  yield extraction.run(start_date, end_date, false, undefined, "wp_"+file_date, undefined, false, false, true);//workpacket
  yield tar(file_date, 'wp');
  yield upload(end_date, 'wp');
  yield mark_exported.run(`vmd_export/wp_${file_date}`, end_date);


  //work complete export
  yield extraction.run(start_date, end_date, false, undefined, "wc_"+file_date, undefined, true, false, true);//workpacket
  yield tar(file_date, 'wc');
  yield upload(end_date, 'wc');
  yield mark_exported.run(`vmd_export/wc_${file_date}`, end_date);

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

  return date.utc();
}


function *unset(date, type) {
  date = santitizeDate(date || 'last saturday');
  var file_date =  date.format("{yyyy}-{MM}-{dd}_{HH}.{mm}.{ss}.000Z");
  yield mark_exported.run(`vmd_export/${type}_${file_date}`, undefined, true);//unset
}

function tar_filename(file_date, type) {
  return `vmd_${type}_export_${file_date}.tar.gz`;
}

/**
 * @description send export email
 */
function *email(date) {
  date = santitizeDate(date || 'last saturday');
  var file_date =  date.format("{yyyy}-{MM}-{dd}_{HH}.{mm}.{ss}.000Z");
  console.log("DATE ", date, file_date);
  var types = ["wp", "wc"];
  var files = [];
  for(var i = 0; i < types.length; i++) {
    var type = types[i];
    var filename = tar_filename(file_date, type);
    var file_names =  yield fs.readdirAsync(`vmd_export/${type}_${file_date}`);

    files.push({
      type: {wp: "WorkPacket", wc: "WorkComplete"}[type],
      name: filename,
      date: date.utc().format("{M}/{d}/{yyyy}"),
      file_count: file_names.length,
      link: `http://file.dispatchr.co/${filename}`    
    });
  }
  
  var email_info = {
    start_date: Date.create(date).rewind('1 week').utc().format("{M}/{d}"),
    end_date: date.utc().format("{M}/{d}"),
    files: files
  };
  console.log("EMAIL", email_info);
  return yield gen_email({
                            to: DISTRIBUTION_LIST, 
                            from: 'Dispatchr <no-reply@dispatchr.com>', 
                            replyTo: 'Gabriel Littman <gabe@dispatchr.com>', 
                            template: 'vmd_export', 
                            values: email_info
                        });
}

/**
 * upload tar files to s3 where they are available for download 
 */
function *upload(date, type) {
  date = santitizeDate(date || 'last saturday');
  var file_date =  date.format("{yyyy}-{MM}-{dd}_{HH}.{mm}.{ss}.000Z");  
  var filename = tar_filename(file_date, type);
  var file = fs.createReadStream(filename);
  yield s3.upload(S3_BUCKET, filename, file);  
}

/**
 * tar and zip up files
 * @param {String} file_date a date formated for use as  a file name
 * @param {String} type the type of export "wp" (work packet) or "wc" Work Compelete
 */
function *tar(file_date, type) {
  var ouput_file = tar_filename(file_date, type);
  assert(!fs.existsSync(ouput_file), "Output File Exists: "+ouput_file);
  var t = spawn('tar', ['-zcvf', ouput_file,`vmd_export/${type}_${file_date}`]);
  console.log('[spawn] childProcess.pid: ', t.childProcess.pid);
  t.childProcess.stdout.on('data', function (data) {
      console.log('[spawn] stdout: ', data.toString());
  });
  t.childProcess.stderr.on('data', function (data) {
      console.log('[spawn] stderr: ', data.toString());
  });
  yield t;
}

//baker module
if (require.main === module) {
  var baker = require('dsp_shared/lib/baker');
  utils.bakerGen(run, { opts: 'params', default: true }); 
  utils.bakerGen(unset);
  utils.bakerGen(upload);
  utils.bakerGen(email);
  baker.run();  
}
