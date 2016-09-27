/* globals CWD */

const CsvModel = require(CWD + '/resources/csv/csv-resource');
const json2csv = require('json2csv');
const fs = require('fs');

var csvWrite = function(req, res, next, csvFields) {
  var data = req.body;

  if (!data) {
    res.status(422).json({ message: 'data is required' });
  } else {
    var csv = new CsvModel();
    csv.saveAsync()
    .then(function(csv) {  
      var dir = CWD + '/public/csv';
      if ( !fs.existsSync(dir) ){
        fs.mkdirSync(dir);
      }
      var csv_path = dir + '/' + csv._id+ '.csv'; 
      var fields = require(CWD + '/resources/csv/' + csvFields).fields;
      var csv_data = json2csv({ data: data, fields: fields });
      fs.writeFile(csv_path, csv_data, function(err) {
        if (err) {
          throw err;
        } else {
          CsvModel.update({ _id: csv._id }, { status: 1 }).exec().then(function() {
            console.log(csv._id + ' generated');
          },function(err) {
            console.error(err);
          });
        }
      }); 
      
      res.status(201).json({
        message: csv._id,
        status: 2
      });
    })
    .catch(err => {console.log(err); next(err);} );
  }
};

module.exports = {
  write: csvWrite
};