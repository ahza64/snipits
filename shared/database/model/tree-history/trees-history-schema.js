const mongoose = require('mongoose');

const treeHistory = new mongoose.Schema({
  action_value: { type: {}, required: true },
  object_type: { type: String, required: true },
  object_id: { type: String, required: true },
  performer_id: { type: String },
  performer_type: { type: String },
  created: { type: Date, default: Date.now }
});

module.exports = treeHistory;
