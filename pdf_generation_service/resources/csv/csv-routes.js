/* globals CWD */

const express = require('express');
const router = express.Router();
const CsvModel = require(CWD + '/resources/csv/csv-resource');
const csvUtil = require(CWD + '/resources/csv/csv-util');

router.post('/divisionreport', (req, res, next) => {
  csvUtil.write(req, res, next, 'division_report');
});

router.post('/productivityreport', (req, res, next) => {
  csvUtil.write(req, res, next, 'productivity_report');
});

router.get('/:id', (req, res) => {
  var id = req.params.id;
  CsvModel.findOne({_id: id}).exec(function (err, csv) {
    if (err) {
      res.status(404).json({
          message: 'Csv not found'
      });
    } else { 
      switch (csv.status){
        case CsvModel.STATUS.IN_PROGRESS:
          res.status(202).json({
           message: 'Csv file creation in process'
          });
          break;
        case CsvModel.STATUS.ERROR:
          res.status(422).json({
            message: csv.errorDetails
          });
          break;
        case CsvModel.STATUS.SUCCESS:
          res.json({
            file: req.protocol + '://' + req.get('host') + '/csv/' + id + '.csv'
          });
          break;
        default:
          res.status(404).json({
            message: 'Csv not found'
          });
      }
    }
  });
});

module.exports = router;

