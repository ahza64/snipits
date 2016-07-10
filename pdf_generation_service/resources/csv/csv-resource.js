const mongoose = require('mongoose');
const Promise = require('bluebird');



const CsvSchema = require('./csv-schema');
const CsvModel = mongoose.model('Csv', CsvSchema);

CsvModel.STATUS = {
  SUCCESS: 1,
  IN_PROGRESS: 2,
  ERROR: 3
};


Promise.promisifyAll(CsvModel);
Promise.promisifyAll(CsvModel.prototype);





module.exports = CsvModel;

