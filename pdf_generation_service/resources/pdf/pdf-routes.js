/* globals CWD */

const express = require('express');
const router = express.Router();
const PdfModel = require(CWD + '/resources/pdf/pdf-resource');
const HtmlPdf = require('html-pdf');
const fs = require('fs');
var path = require('path');
var childProcess = require('child_process');
var phantomjs = require('phantomjs');
var binPath = phantomjs.path;
 
router.post('/', (req, res, next) => {
  var html = req.body.data;
  var url = req.body.url;
  if (!html) {
    res.status(422).json
    ({
      message: "Html data is required"
    });
  } else {
    var pdf = new PdfModel();
    pdf.saveAsync()
    .then(function(pdf) {
      var dir = CWD + "/public/pdf";
      if ( !fs.existsSync(dir) ){
        fs.mkdirSync(dir);
      }
      var childArgs = [
        path.join(__dirname, 'rasterize.js'),
        url,
        dir + '/' + pdf._id+ '.pdf'  
      ];
 
      console.log(childArgs);
      childProcess.execFile(binPath, childArgs, function(err, stdout, stderr) {
        // handle results 
        console.log('stdout: ', stdout);
        console.log(pdf._id, typeof pdf._id);
        if(stdout){
          PdfModel.update({ _id: pdf._id }, { status: 1 }).exec().then(function(res) {
            console.log(res);
          },function(err) {
            console.error(err);
          });
        }
        console.log('stderr: ', stderr);
        console.error('err: ', err);
      });
      res.status(201).json({
        message: pdf._id,
        status: 2
      });
    })
    .catch(err => next(err));
  }
});

router.get('/:id', (req, res) => {
  var id = req.params.id;
  PdfModel.findOne({_id: id}).exec(function (err, pdf) {
    if (err) {
      res.status(404).json({
          message: "Pdf not found"
      });
    } else { 
      switch (pdf.status){
        case PdfModel.STATUS.IN_PROGRESS:
          res.status(202).json({
           message: "Pdf file creation in process"
          });
          break;
        case PdfModel.STATUS.ERROR:
          res.status(422).json({
            message: pdf.errorDetails
          });
          break;
        case PdfModel.STATUS.SUCCESS:
          res.json({
            file: req.protocol + '://' + req.get('host') + '/pdf/' + id + ".pdf"
          });
          break;
        default:
          res.status(404).json({
            message: "Pdf not found"
          });
      }
    }
  });
});

module.exports = router;

