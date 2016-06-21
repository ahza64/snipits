var mongoose = require('mongoose');
var connection = require('dsp_database/connections')('meteor');

var divisionsSchema = new mongoose.Schema({
 division: String,
 project_details: [{
   pge_pmd_num: String,
   name: String,
   detected_count: Number,
   allgood_count: Number,
   inspected_count: Number,
   listed_count: Number,
   worked_count: Number,
   total_count: Number,
   work_type: String
 }],
 line_details: [{
   pge_pmd_num: String,
   _id: String,
   name: String,
   url: String,
   detected_count: Number,
   allgood_count: Number,
   inspected_count: Number,
   listed_count: Number,
   worked_count: Number,
   total_count: Number,
   detected_count_orchard: Number,
   allgood_count_orchard: Number,
   inspected_count_orchard: Number,
   listed_count_orchard: Number,
   worked_count_orchard: Number,
   total_count_orchard: Number
 }],
 city_details: [{
   pge_pmd_num: String,
   city: String,
   city_id: String,
   detected_count: Number,
   allgood_count: Number,
   inspected_count: Number,
   listed_count: Number,
   worked_count: Number,
   total_count: Number,
   detected_count_orchard: Number,
   allgood_count_orchard: Number,
   inspected_count_orchard: Number,
   listed_count_orchard: Number,
   worked_count_orchard: Number,
   total_count_orchard: Number
 }],
 project: String,
 total_count: Number,
 detected_count: Number,
 inspected_count: Number,
 listed_count: Number,
 worked_count: Number,
 allgood_count: Number,
 total_count_orchard: Number,
 detected_count_orchard: Number,
 inspected_count_orchard: Number,
 listed_count_orchard: Number,
 worked_count_orchard: Number,
 allgood_count_orchard: Number
});

module.exports = connection.model('Division', divisionsSchema);