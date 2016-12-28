const mongoose = require('mongoose');

const treeHistory = new mongoose.Schema({
  action_value: { type: {}, required: true },
  object_type: { type: String, required: true, index: true },
  object_id: { type: String, required: true, index: true },
  performer_id: { type: String, index: true },
  performer_type: { type: String, index: true},
  request_created: { type: Date, index: true },
  created: { type: Date, default: Date.now, index: true },
  applied_date: { type: Date, index: true },
  source: { type: String, index: true}
});

module.exports = treeHistory;
