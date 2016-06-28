
const express = require('express');
const router = express.Router();
const PdfModel = require(CWD + '/resources/pdf/pdf-resource');
const HtmlPdf = require('html-pdf');
const fs = require('fs');


router.post('/', (req, res, next) => {
  var html = req.body.data;
  if (!html) {
    res.status(422).json
    ({
      message: "Html data is required"
    });
  } else {
    var pdf = new PdfModel();
    pdf.saveAsync()
    .then(function(pdf) {
      var options = { format: 'Letter' };
      var dir = CWD + "/public/pdf";
      if (!fs.existsSync(dir))
        fs.mkdirSync(dir);
      HtmlPdf.create(html, options)
      .toFile(dir + '/' + pdf._id+ '.pdf', function(err, res) {
        if (err) return console.error(err);
        console.log(res); // { filename: '/app/businesscard.pdf' }
      });
      res.status(201).json({
        message: pdf._id
      })
    })
    .catch(err => next(err));
  }
});

router.get('/:id', (req, res, next) => {
  var id = req.params.id;
  var pdf = PdfModel.findOne({_id: id});
  var file = CWD + "/public/pdf/" + id + ".pdf";
  if (!pdf) {
    res.status(404).json({
      message: "Pdf not found"
    });
  } else if (pdf.status == PdfModel.STATUS.IN_PROGRESS) {
    res.status(202).json({
      message: "Pdf file creation in process"
    });
  } else if (pdf.status == PdfModel.STATUS.ERROR) {
    res.status(422).json({
      message: pdf.errorDetails
    });
  } else {
    res.json({
      file: req.protocol + '://' + req.get('host') + "/pdf/" + id + ".pdf"
    })
  }
});
module.exports = router;

