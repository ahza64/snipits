const mongoose = require('mongoose');
const mongooseTimestamps = require('mongoose-timestamp');
const Schema = mongoose.Schema;



/**
 * The PDF Schema.
 * @type {Schema}
 */
const pdfSchema = new Schema({
});


/**
 *
 */

pdfSchema.plugin(mongooseTimestamps);



/**
 *
 */
module.exports = pdfSchema;

