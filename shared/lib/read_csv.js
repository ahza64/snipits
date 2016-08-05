const parse = require('csv-parse');
const BPromise = require("bluebird");
const fs = require('fs');
const _ = require('underscore');

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
      console.log("CSV Record Count:", _.size(records));
      resolve(records);
    });
    parser.on('error', function(error){
      reject(error);
    });
  });
}

module.exports = readCSVExport;