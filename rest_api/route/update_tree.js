/**
 * @fileOverview Route to add,edit update tree and workorder
 */

var Cuf = require('dsp_shared/database/model/cufs');
var router = require('koa-router')();
var koa = require('koa');
var Tree = require('dsp_shared/database/model/tree');
var geocode = require('dsp_shared/lib/gis/google_geocode');
var crud_opts = require('../crud_op')(Tree);
var app = koa();
var TreeHistory = require('dsp_shared/database/model/tree-history');

router.post('/workorder/:woId/tree', function *(){
  var woId = this.params.woId;
  var userId = this.req.user._id;
  var treeObj = this.request.body;
  var result = null;
  var addressObj = null;
  try {
    if(treeObj.location){
      addressObj = yield geocode.getAddress(treeObj.location.coordinates[0], treeObj.location.coordinates[1]);
      treeObj.streetName = addressObj.streetName;
      treeObj.streetNumber = addressObj.streetNumber;
      treeObj.zipcode = addressObj.zipcode;
      treeObj.state = addressObj.administrativeLevels.level1short;
      treeObj.city = addressObj.city;
      treeObj.county = addressObj.administrativeLevels.level2long;
    }
    result = yield crud_opts.create(treeObj);
    result = yield crud_opts.read(result._id);
    yield TreeHistory.recordTreeHistory({}, result, this.req.user);
    console.log('PUSHING THIS ID', result._id.toString());
    this.body = result;

    Cuf.update({_id: userId, 'workorder._id': woId}, {'$push': {'workorder.$.tasks': result._id.toString()}}, function(err, data){
      if(err) { console.log(err); }
      else {
        console.log('Tree ' + result._id + ' added and Workorder ' + woId + ' updated', data);
      }
    });
  } catch(e) {
    throw ('Tree not added', 500);
  }

  return result;
});

router.patch('/workorder/:woId/tree/:treeId', function *(){
  var treeId = this.params.treeId;
  var treeUpdates = this.request.body;
  var result = null;

  try {
    var tree = yield Tree.findOne({_id:treeId});
    result = yield crud_opts.patch(treeId, treeUpdates, this.header['content-type']);
    yield TreeHistory.recordTreeHistory(tree, result, this.req.user);
    this.body = result;
    this.dsp_env.msg = 'Tree Successfully Edited';
  } catch(e) {
    throw ('Tree not added', 500);
  }

  return result;
});

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
