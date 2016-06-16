const mongoose = require('mongoose');
const connection = require('dsp_database/connections')('meteor');

const workorderSchema = new mongoose.Schema({
  uniq_id: { type: String, index: { unique: true }},
  span_name: String,
  name: Number,
  pge_pmd_num: String,
  city: String,
  streetName: String,
  streetNumber: String,
  zipcode: String,
  tasks: { type: [] }
});

module.exports = connection.model('workorders', workorderSchema);
