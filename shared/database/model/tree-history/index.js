const _ = require('underscore');
const connection = require('dsp_database/connections')('meteor');
const historySchema = require('./trees-history-schema');
const TreeHistoryPGModel = require('./trees-history-pg-schema');
const diff = require('deep-diff');
const IGNORE_FIELDS = ['inc_id', 'tree_id'];
const DELETED = '---deleted---';
const utils = require('dsp_lib/utils');
const mongoose = require('mongoose');

historySchema.statics.recordTreeHistory = function(oldTree, newTree, user, queued, source) {
  var changes = diff(utils.toJSON(oldTree), utils.toJSON(newTree));
  return TreeHistoryModel.create(changes, newTree, user, queued, source);
};

historySchema.statics.create = function(treeDiff, tree, user, queued, source) {
  var eligibleChanges = _.filter(treeDiff, diff => IGNORE_FIELDS.indexOf(diff.path.join()) === -1);
  var treeHistory = {};
  eligibleChanges.map(diff => generateRecord(diff, tree, treeHistory));
  var historyRecord = singleHistoryRecord(tree, user, treeHistory, queued, source);
  var historyRecordPg = historyRecord;
  historyRecordPg.object_id = historyRecord.object_id.toString();

  if(Object.keys(treeHistory).length > 0) {
    // console.log("HISTORY", treeHistory);
    return TreeHistoryPGModel.build(historyRecord).save()
    .then(() => TreeHistoryModel.collection.insertOne(historyRecord))
    .then(() => historyRecord)
    .catch(err => {
      console.error('TreeHistoryError ' + err);
      return Promise.reject(err);
    });
  } else {
    return Promise.resolve(null);
  }
};

historySchema.statics.buildVersion = function(type, id, date) {
  return TreeHistoryModel.find({
                                  object_type: type,
                                  object_id: id,
                                  $or: [
                                    {request_created: {$lt: date}}
                                  ]
                              }).sort({request_created: 1})
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

    console.log("GOT HISTORIES", histories.length); 

    //reconstitue
    var result = {};
    for(var i = 0; i < histories.length; i++) {
      _.extend(result, histories[i].action_value);
      for(var key in result) {
        if(result.hasOwnProperty(key) && result[key] === DELETED) {
          delete result[key];
        }
      }      
    }
    return result;

  });
};


historySchema.statics.iterVersions = function*(type, id, date) {
  date = date || new Date();
  var stream = stream(TreeHistoryModel, {
                                  object_type: type,
                                  object_id: id,
                                  $or: [
                                    {request_created: {$lt: date}}
                                  ]
                              },{request_created: 1});


  var cur_version = {};
  for(var hist of stream) {
    _.extend(cur_version, hist.action_value);
    for(var key in hist) {
      if(cur_version.hasOwnProperty(key) && cur_version[key] === DELETED) {
        delete cur_version[key];
      }
    }          
    yield cur_version;    
  }
};

//https://github.com/jquery/jquery/blob/master/src/core.js
function isNumeric( obj ) {

		return ( _.isNumber(obj) || _.isString(obj) ) &&

		// parseFloat NaNs numeric-cast false positives ("")
		// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
		// subtraction forces infinities to NaN
		!isNaN( obj - parseFloat( obj ) );
}

function generateRecord(treeDiff, tree, result) {
  // console.log(treeDiff);
  var columnName = treeDiff.path[0];
  var item;
  // console.log("treeDiff", treeDiff, tree, result);

  // Map annotations is an edge case, since they come in nested object/array form
  if(columnName === 'map_annotations') {
    if(!result[columnName]) { result[columnName] = []; }
    var index = treeDiff.path.length > 1 ? treeDiff.path.pop() : treeDiff.index;
    item = treeDiff.item || treeDiff;

    result[columnName][index] = item.rhs || DELETED;
  } else if(columnName === "location") {    
    if(!result.location) {
      result.location = _.extend({}, tree.location);
    }
    var tmp = result;
    for(var i = 0 ; i < treeDiff.path.length; i++) {
      var field = treeDiff.path[i];
      tmp[field] = tmp[field] || (isNumeric(tmp[field]) ? [] : {});
      tmp = tmp[field];
    }
  } else {
    item = treeDiff;
    result[treeDiff.path.join('.')] = item.rhs || DELETED;
  }

  // console.log("RESULT", result);
  return result;
}

function singleHistoryRecord(tree, user, json, timestamp, source) {
  if(timestamp) {
    timestamp = Date.create(timestamp); //wrapping null or 0 in crate creates a date at 1970-01-01 00:00:00.000Z
  }
  return {
    action_value: json,
    object_type: 'Tree',
    object_id: mongoose.Types.ObjectId(tree._id),
    performer_id: user._id,
    performer_type: user.type || 'User',
    source: source,
    request_created: timestamp || new Date(),
    created: new Date()
  };
}


const TreeHistoryModel = connection.model('histories', historySchema);

module.exports = TreeHistoryModel;
