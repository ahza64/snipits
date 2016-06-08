var utils = require('dsp_shared/lib/cmd_utils');
var log = require('log4js').getLogger('['+__filename+']');

require("sugar");
var _ = require("underscore");
var parse = require('csv-parse');
var fs = require("fs");
var BPromise = require("bluebird");
var readDir = BPromise.promisify(fs.readdir);
var path = require('path');


utils.connect(["database"]);
var Export = require("dsp_shared/database/model/export");

function readCSVExport(file_path){
  return new BPromise(function(resolve, reject){
    console.log("READING", file_path);
    var parser = parse({columns: true});    
    var input = fs.createReadStream(file_path);
    input.pipe(parser);
    var records = [];

    parser.on('readable', function(){
      while(true){
        var record = parser.read();
        if( record ) {
          records.push(record);
        } else {
          break;
        }
      }
    });
    
    parser.on('end', function(){
      log.info("CSV Record Count:", _.size(records));
      resolve(records);
    });
    parser.on('error', function(error){
      reject(error);
    });
  });
}

function *store_export(file, date){
  console.log("store_export", file, date);    
  var i;
  if(!file.endsWith('csv')) {
    var files = yield readDir(file);
    for(i = 0; i < files.length; i++) {
      var f = files[i];
      if(f.endsWith('csv')){
        f = path.join(file, f);
        yield store_export(f, date);
      }
    }
  } else {
    date = Date.create(date)
    var data = yield readCSVExport(file);
    console.log("GOT DATE", date)
    
    var type = path.basename(file);
    type = type.substring(0, type.length-4);
    console.log("TYPE", type);    
    for(i = 0; i < data.length; i++){
      yield Export.create({data: data[i], type: type, export_date: date});
    }
  }
}



if (require.main === module) {

  utils.bakerGen(store_export, {default: true, dbs: ['database']});  
  utils.bakerRun();  
}