const mongoose = require('mongoose');
const Promise = require('bluebird');



const pdfSchema = require('./pdf-schema');
const PdfModel = mongoose.model('Pdf', pdfSchema);
Promise.promisifyAll(PdfModel);
Promise.promisifyAll(PdfModel.prototype);





module.exports = PdfModel;

