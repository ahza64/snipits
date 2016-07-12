const mongoose = require('mongoose');
const mongooseTimestamps = require('mongoose-timestamp');
const Schema = mongoose.Schema;



/**
 * The PDF Schema.
 * @type {Schema}
 */
const CsvSchema = new Schema({
  status: {type: Number, default: 2},
  errorDetails: {type: String}
});


/**
 *
 */

CsvSchema.plugin(mongooseTimestamps);



/**
 *
 */
module.exports = CsvSchema;

