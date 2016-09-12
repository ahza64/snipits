const _ = require('underscore');
const connection = require('dsp_database/connections')('meteor');
const historySchema = require('./trees-history-schema');
const TreeHistoryPGModel = require('./trees-history-pg-schema');
const diff = require('deep-diff');
const IGNORE_FIELDS = ['inc_id', 'tree_id'];
const DELETED = '---deleted---';
const utils = require('dsp_lib/utils');
const mongoose = require('mongoose');

historySchema.statics.recordTreeHistory = function(oldTree, newTree, user, queued) {
  var changes = diff(utils.toJSON(oldTree), utils.toJSON(newTree));
  console.log("CHANGES", changes);
  return TreeHistoryModel.create(changes, newTree, user, queued);
};

historySchema.statics.create = function(treeDiff, tree, user, queued) {
  var eligibleChanges = _.filter(treeDiff, diff => IGNORE_FIELDS.indexOf(diff.path.join()) === -1);
  var treeHistory = {};
  eligibleChanges.map(diff => generateRecord(diff, tree, treeHistory));
  var historyRecord = singleHistoryRecord(tree, user, treeHistory, queued);
  var historyRecordPg = historyRecord;
  historyRecordPg.object_id = historyRecord.object_id.toString();

  if(Object.keys(treeHistory).length > 0) {
    // console.log("HISTORY", treeHistory);
    return TreeHistoryPGModel.build(historyRecord).save()
    .then(() => TreeHistoryModel.collection.insertOne(historyRecord))
    .catch(err => {
      console.error('TreeHistoryError ' + err);
      return Promise.reject(err);
    });
  }
};

historySchema.statics.buildVersion = function(type, id, date) {
  return TreeHistoryModel.find({
                                  object_type: type,
                                  object_id: id,
                                  $or: [
                                    {request_created: {$lt: date}},
                                    {created: {$lt: date}}
                                  ]
                              }).sort({request_created: 1, created: 1})
  .then(histories => {
    histories.sort((h1, h2) => {
      var d1 = h1.request_created || h1.created;
      var d2 = h2.request_created || h1.created;
      if(d1 < d2) {
        return -1;
      }
      if(d1 > d2) {
        return 1;
      }
      return 0;
    });

    //reconstitue
    var result = {};
    for(var i = 0; i < histories.length; i++) {
      _.extend(result, histories[i].action_value);
    }

  });
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
    object_id: mongoose.Types.ObjectId(tree._id),
    performer_id: user._id,
    performer_type: user.type || 'User',
    request_created: Date.create(timestamp) || new Date(),
    created: new Date()
  };
}


const TreeHistoryModel = connection.model('histories', historySchema);

module.exports = TreeHistoryModel;
