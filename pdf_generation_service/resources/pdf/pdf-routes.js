
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
        if (err) return console.log(err);
        console.error(res); // { filename: '/app/businesscard.pdf' }
      });
      res.json({
        _id: pdf._id
      })
    })
    .catch(err => next(err));
  }
});
module.exports = router;

