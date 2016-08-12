const _ = require('underscore');
const connection = require('dsp_database/connections')('meteor');
const historySchema = require('./trees-history-schema');
const TreeHistoryPGModel = require('./trees-history-pg-schema');
const diff = require('deep-diff');
const IGNORE_FIELDS = ['inc_id', 'tree_id'];
const DELETED = '---deleted---';
const utils = require('dsp_lib/utils');

historySchema.statics.recordTreeHistory = function(oldTree, newTree, user, queued) {
  var changes = diff(oldTree, utils.toJSON(newTree));
  return TreeHistoryModel.create(changes, newTree, user, queued);
};

historySchema.statics.create = function(treeDiff, tree, user, queued) {
  var eligibleChanges = _.filter(treeDiff, diff => IGNORE_FIELDS.indexOf(diff.path.join()) === -1);
  console.log("CHANGES", eligibleChanges);
  var treeHistory = {};
  eligibleChanges.map(diff => generateRecord(diff, tree, treeHistory));
  var historyRecord = singleHistoryRecord(tree, user, treeHistory, queued);
  var historyRecordPg = historyRecord;
  historyRecordPg.object_id = historyRecord.object_id.toString();

  if(Object.keys(treeHistory).length > 0) {
    return TreeHistoryPGModel.build(historyRecord).save()
    .then(() => TreeHistoryModel.collection.insertOne(historyRecord))
    .catch(err => {
      console.error('TreeHistoryError ' + err);
      return Promise.reject(err);
    });
  }
};

function generateRecord(treeDiff, tree, result) {
  var columnName = treeDiff.path[0];
  var item;

  // Map annotations is an edge case, since they come in nested object/array form
  if(columnName === 'map_annotations') {
    if(!result[columnName]) { result[columnName] = []; }
    var index = treeDiff.path.length > 1 ? treeDiff.path.pop() : treeDiff.index;
    item = treeDiff.item || treeDiff;

    result[columnName][index] = item.rhs || DELETED;
  } else {
    item = treeDiff;
    result[treeDiff.path.join('.')] = item.rhs || DELETED;
  }

  return result;
}

function singleHistoryRecord(tree, user, json, timestamp) {
  return {
    action_value: json,
    object_type: 'Tree',
    object_id: tree._id,
    performer_id: user._id,
    performer_type: user.type || 'User',
    request_created: timestamp || new Date(),
    created: new Date()
  };
}


const TreeHistoryModel = connection.model('histories', historySchema);

module.exports = TreeHistoryModel;
