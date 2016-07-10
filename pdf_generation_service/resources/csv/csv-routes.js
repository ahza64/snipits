/* globals CWD */

const express = require('express');
const router = express.Router();
const CsvModel = require(CWD + '/resources/csv/csv-resource');
const json2csv = require('json2csv');
const fs = require('fs');
var path = require('path');

router.post('/', (req, res, next) => {
  var data = req.body;
  console.log(data);
  if (!data) {
    res.status(422).json
    ({
      message: "data is required"
    });
  } else {
    var csv = new CsvModel();
    csv.saveAsync()
    .then(function(csv) {  
      var dir = CWD + "/public/csv";
      if ( !fs.existsSync(dir) ){
        fs.mkdirSync(dir);
      }
      var csv_path = dir + '/' + csv._id+ '.csv'; 
      var fields = require(CWD + '/resources/csv/csv_fields').fields;
      var csv_data = json2csv({ data: data, fields: fields });
      fs.writeFile(csv_path, csv_data, function(err) {
        if (err) {
          throw err;
        } else {
          CsvModel.update({ _id: csv._id }, { status: 1 }).exec().then(function(res) {
            console.log(res);
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
});

router.get('/:id', (req, res) => {
  var id = req.params.id;
  CsvModel.findOne({_id: id}).exec(function (err, csv) {
    if (err) {
      res.status(404).json({
          message: "Csv not found"
      });
    } else { 
      switch (csv.status){
        case CsvModel.STATUS.IN_PROGRESS:
          res.status(202).json({
           message: "Csv file creation in process"
          });
          break;
        case CsvModel.STATUS.ERROR:
          res.status(422).json({
            message: csv.errorDetails
          });
          break;
        case CsvModel.STATUS.SUCCESS:
          res.json({
            file: req.protocol + '://' + req.get('host') + '/csv/' + id + ".csv"
          });
          break;
        default:
          res.status(404).json({
            message: "Csv not found"
          });
      }
    }
  });
});

module.exports = router;

