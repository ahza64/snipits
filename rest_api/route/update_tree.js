/**
 * @fileOverview Route to add,edit update tree and workorder
 */

var Cuf = require('dsp_shared/database/model/cufs');
var router = require('koa-router')();
var koa = require('koa');
var Tree = require('dsp_shared/database/model/tree');
var geocode = require('dsp_shared/lib/gis/google_geocode');
var crud_opts = require('../crud_op')(Tree);
var _ = require('underscore');
var app = koa();
var TreeHistory = require('dsp_shared/database/model/tree-history');

function *addMissingFields(treeObj, woId, user) {
  var tree = null;
  var workOrder = _.find(user.workorder, wo => {
    if(wo._id === woId){
      return wo;
    }
  });
  var treeId = workOrder.tasks[0];
  tree = yield crud_opts.read(treeId);
  treeObj.pge_pmd_num = workOrder.pge_pmd_num || tree.pge_pmd_num;
  treeObj.span_name = workOrder.span_name || tree.span_name;
  treeObj.division = workOrder.division || tree.division;
  treeObj.region = workOrder.region || tree.region;
  treeObj.circuit_name = workOrder.circuit_name || tree.circuit_name;
  return treeObj;
}

function *getAddress(treeObj, x, y) {
  var addressObj = yield geocode.getAddress(x, y);
  treeObj.streetName = addressObj.streetName;
  treeObj.streetNumber = addressObj.streetNumber;
  treeObj.zipcode = addressObj.zipcode;
  treeObj.state = addressObj.state;
  treeObj.city = addressObj.city;
  treeObj.county = addressObj.county;

  return treeObj;
}


/**
 * Route for adding a new tree
 *
 * @return {type}  description
 */
router.post('/workorder/:woId/tree', function *(){
  var woId = this.params.woId;
  var userId = this.req.user._id;
  var treeObj = this.request.body;
  var treeDone = treeObj.assignment_complete;
  var result = null;
  try {
    treeObj = yield getAddress(treeObj, treeObj.location.coordinates[0], treeObj.location.coordinates[1]);

    //if tree is marked as done
    if(treeDone) {
      treeObj = yield addMissingFields(treeObj, woId, this.req.user);
      result = yield crud_opts.create(treeObj);
      result = yield crud_opts.read(result._id);
      this.body = result;
    } else {
      result = yield crud_opts.create(treeObj);
      result = yield crud_opts.read(result._id);
      console.log('PUSHING THIS ID', result._id.toString());
      this.body = result;
      Cuf.update({_id: userId, 'workorder._id': woId}, {'$push': {'workorder.$.tasks': result._id.toString()}}, function(err, data){
        if(err) { console.log(err); }
        else {
          console.log('Tree ' + result._id + ' added and Workorder ' + woId + ' updated', data);
        }
      });
    }
  } catch(e) {
    throw ('Tree not added', 500);
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
  var userId = this.req.user._id;
  var treeUpdates = this.request.body;
  var treeDone = treeUpdates.assignment_complete;
  var result = null;

  try {
    if(treeDone) {
      treeUpdates.assigned_user_id = null;
      result = yield crud_opts.patch(treeId, treeUpdates, this.header['content-type']);
      Cuf.update({_id: userId, 'workorder._id': woId}, {'$pull': {'workorder.$.tasks': treeId}}, function(err, data){
        if(err) { console.log(err); }
        else {
          console.log('Tree' + treeId + 'removed and Workorder' + woId + 'updated', data);
        }
      });
      this.body = result;
      this.dsp_env.msg = 'Tree Successfully Completed';
    } else {
      result = yield crud_opts.patch(treeId, treeUpdates, this.header['content-type']);
      this.body = result;
      this.dsp_env.msg = 'Tree Successfully Edited';
    }
  } catch(e) {
    throw ('Tree not updated', 500);
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
  var userId = this.req.user._id;
  var treeUpdates = this.request.body;

  var result = null;

  try {
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
  } catch(e) {
    console.log(e);
    throw('Failed to delete', 500);
  }
  return result;
});

app.use(router.routes());
module.exports = app;

if (require.main === module) {
  app.listen(3000);
}
