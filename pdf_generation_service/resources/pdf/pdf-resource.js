const mongoose = require('mongoose');
const Promise = require('bluebird');



const PdfSchema = require('./pdf-schema');
const PdfModel = mongoose.model('Pdf', PdfSchema);

PdfModel.STATUS = {
  SUCCESS: 1,
  IN_PROGRESS: 2,
  ERROR: 3
}


Promise.promisifyAll(PdfModel);
Promise.promisifyAll(PdfModel.prototype);





module.exports = PdfModel;

