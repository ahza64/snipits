/**
 * @fileOverview Route to add,edit update tree and workorder
 */

var Cuf = require('dsp_shared/database/model/cufs');
var router = require('koa-router')();
var koa = require('koa');
var Tree = require('dsp_shared/database/model/tree');
var User = require('dsp_shared/database/model/cufs');
var TreeHistory = require('dsp_shared/database/model/tree-history');
var Pmd = require('dsp_shared/database/model/pmd');
var geocode = require('dsp_shared/lib/gis/google_geocode');
var crud_opts = require('../crud_op')(Tree);
var _ = require('underscore');
var app = koa();
var TreeHistory = require('dsp_shared/database/model/tree-history');
var config = require('../routes_config').update;

/**
 * addMissingFields - add missing fields to a newly added tree
 *
 * @param  {Object} treeObj
 * @param  {String} woId
 * @param  {Object} user
 * @return {Object}
 */
function *addMissingFields(treeObj, woId, user) {
  var tree = null;
  var workOrder = _.find(user.workorder, wo => {
    if(wo._id === woId){
      return wo;
    }
  });
  var pmd = yield Pmd.findOne({pge_pmd_num: workOrder.pge_pmd_num});
  var treeId = workOrder.tasks[0];
  tree = yield crud_opts.read(treeId);
  console.log(workOrder.pge_pmd_num, pmd.pge_pmd_num);
  treeObj.pge_pmd_num = workOrder.pge_pmd_num || pmd.pge_pmd_num;
  treeObj.span_name = workOrder.span_name || pmd.span_name;
  treeObj.division = workOrder.division || pmd.division;
  treeObj.region = workOrder.region || pmd.region;
  treeObj.circuit_name = workOrder.circuit_names[0] || tree.circuit_name;
  return treeObj;
}


/**
 * getAddress - get geocoded address
 *
 * @param  {Object} treeObj
 * @param  {Number} x
 * @param  {Number} y
 * @return {Object}
 */
function *setAddress(treeObj) {
  var addressObj = yield geocode.getAddress(treeObj.location.coordinates[0], treeObj.location.coordinates[1]);
  treeObj.streetName = addressObj.streetName;
  treeObj.streetNumber = addressObj.streetNumber;
  treeObj.zipcode = addressObj.zipcode;
  treeObj.state = addressObj.state;
  treeObj.city = addressObj.city;
  treeObj.county = addressObj.county;

  return treeObj;
}


/**
 * addNewTree - adds a new tree to the Tree collection
 *
 * @param  {Object} treeObj
 * @param  {String} woId
 * @param  {Object} user
 * @return {Object}
 */
function *addNewTree(treeObj, woId, user){
  var result = null;
  var newTreeObj = yield addMissingFields(treeObj, woId, user);
  result = yield crud_opts.create(newTreeObj);
  result = yield crud_opts.read(result._id);
  return result;
}


/**
 * updateTree - updates existing tree
 *
 * @param  {type} treeId
 * @param  {type} treeUpdates
 * @return {Object}
 */
function *updateTree(treeId, treeUpdates, instance){
  return yield crud_opts.patch(treeId, treeUpdates, instance.header['content-type']);
}

/**
 * addTreeToWorkorder - add newly added tree to current workorder
 *
 * @param  {type} userId
 * @param  {type} woId
 * @param  {type} treeId
 * @return {type}
 */
function *addTreeToWorkorder(userId, woId, treeId){
  try {
    var data = yield Cuf.update({_id: userId, 'workorder._id': woId}, {'$push': {'workorder.$.tasks': treeId}});
    console.log('Tree ' + treeId + ' added and Workorder ' + woId + ' updated', data);
  } catch (err) {
    console.log(err);
  }
}

/**
 * removeTreeFromWorkorder - remove tree from workorder
 *
 * @param  {String} userId
 * @param  {String} woId
 * @param  {String} treeId
 * @return {void}
 */
function *removeTreeFromWorkorder(userId, woId, treeId){
  try {
    var data = yield Cuf.update({_id: userId, 'workorder._id': woId}, {'$pull': {'workorder.$.tasks': treeId}});
    console.log('Tree' + treeId + 'removed and Workorder' + woId + 'updated', data);
  } catch (err){
    console.error(err);
  }
}

/**
 * checkLocation - get tree counts at the same location
 *
 * @param  {Object} location
 * @return {Number}
 */
function *checkLocation(location){
  return yield Tree.find({'location.coordinates': location}).count();
}

/**
 * Route for adding a new tree
 *
 * @return {type}  description
 */
router.post('/workorder/:woId/tree', function *(){
  var woId = this.params.woId;
  var treeObj = this.request.body;
  var treeDone = treeObj.assignment_complete;
  var result = null;
  var userId = this.req.user._id;
  var user_exclude = {};

  //exclude from user
  _.each(config.exclude, field => {
    user_exclude[field] = 0;
  });

  try {
    var user = yield User.findOne({_id: userId}).select(user_exclude);
    //check if a tree exists at the same location
    var duplicateTree = yield checkLocation(treeObj.location.coordinates);
    if(duplicateTree > 0){
      throw ('Duplicate Tree at this location', 400);
    }
    //get address from google reverse geocode
    treeObj = yield setAddress(treeObj);

    //if new tree is marked as done
    result = yield addNewTree(treeObj, woId, user);
    this.body = result;

    if(!treeDone) {
      yield addTreeToWorkorder(userId, woId, result._id.toString());
    }
    yield TreeHistory.recordTreeHistory({}, result, user);
  } catch(e) {
    console.log('EXCEPTION: ', e);
    if(e === 400) {
      console.error(e.message);
      this.dsp_env.msg = 'DUPLICATE TREE AT THIS LOCATION';
      this.dsp_env.status = 400;
    } else {
      console.error(e.message);
      this.dsp_env.msg = 'TREE NOT ADDED';
      this.dsp_env.error = e.message;
    }
  }
  return result;
});

/**
 * Route for updating a tree
 *
 * @return {type}  description
 */
router.patch('/workorder/:woId/tree/:treeId', function *(){
  var treeId = this.params.treeId;
  var woId = this.params.woId;
  var treeUpdates = this.request.body;
  var treeDone = treeUpdates.assignment_complete;
  var result = null;
  var userId = this.req.user._id;
  var user_exclude = {};

  //exclude from user
  _.each(config.exclude, field => {
    user_exclude[field] = 0;
  });

  try {
    var user = yield User.findOne({_id: userId}).select(user_exclude);
    var tree = yield Tree.findOne({_id:treeId});
    //if existing tree is marked as done
    if(treeDone) {
      treeUpdates.assigned_user_id = null;
      result = yield updateTree(treeId, treeUpdates, this);
      yield removeTreeFromWorkorder(userId, woId, treeId);
      this.dsp_env.msg = 'Tree Successfully Completed';
    } else {
      result = yield updateTree(treeId, treeUpdates, this);
      this.dsp_env.msg = 'Tree Successfully Updated';
    }
    this.body = result;
    yield TreeHistory.recordTreeHistory(tree, result, user);
  } catch(e) {
    console.log(e.message);
    this.dsp_env.error = e.message;
    this.dsp_env.status = 500;
  }
  return result;
});

/**
 * Route for deleting a  tree
 *
 * @return {type}  description
 */
router.delete('/workorder/:woId/tree/:treeId', function *(){
  var woId = this.params.woId;
  var treeId = this.params.treeId;
  var treeUpdates = this.request.body;
  var result = null;
  var userId = this.req.user._id;
  var user_exclude = {};

  //exclude from user
  _.each(config.exclude, field => {
    user_exclude[field] = 0;
  });

  try {
    var user = yield User.findOne({_id: userId}).select(user_exclude);
    var tree = yield Tree.findOne({_id:treeId});
    result = yield crud_opts.patch(treeId, treeUpdates, this.header['content-type']);
    yield TreeHistory.recordTreeHistory(tree, result, this.req.user);
    this.body = result;
    Cuf.update({_id: userId, 'workorder._id': woId}, {'$pull': {'workorder.$.tasks': treeId}}, function(err, data){
      if(err) { console.log(err); }
      else {
        console.log('Tree' + treeId + 'removed and Workorder' + woId + 'updated', data);
      }
    });
    yield TreeHistory.recordTreeHistory(tree, result, user);
  } catch(e) {
    console.log(e.message);
    this.dsp_env.error = e.message;
    this.dsp_env.status = 500;
  }
  return result;
});

app.use(router.routes());
module.exports = app;

if (require.main === module) {
  app.listen(3000);
}
