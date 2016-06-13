const mongoose = require('mongoose');
const mongooseTimestamps = require('mongoose-timestamp');
const Schema = mongoose.Schema;



/**
 * The PDF Schema.
 * @type {Schema}
 */
const PdfSchema = new Schema({
  status: {type: Number, default: 2},
  errorDetails: {type: String}
});


/**
 *
 */

PdfSchema.plugin(mongooseTimestamps);



/**
 *
 */
module.exports = PdfSchema;

