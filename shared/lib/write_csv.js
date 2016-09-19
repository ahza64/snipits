var fs = require('fs');
var json2csv = require('json2csv');

function createCSV(fields, data, filename){

  var csvObject = {
    data: data,
    fields: fields
  };
  var csv = json2csv(csvObject);

  fs.writeFile(filename, csv, function(err){
    if(err) {
      throw err;
    }
    console.log('File Saved!');
  });
}

module.exports = createCSV;
