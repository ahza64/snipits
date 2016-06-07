
const express = require('express');
const router = express.Router();
const PdfModel = require('../pdf/pdf-resource');


router.post('/', (req, res, next) => {
  var html = req.params.data;
  if (!html) {
    res.status(422).json
    ({
      message: "Html data is required"
    });
  } else {
    var pdf = new PdfModel();
    pdf.saveAsync()
    .then(pdf => res.json({
        _id: pdf._id
      })
    )
    .catch(err => next(err));
  }
});
module.exports = router;

