var Cuf = require('dsp_shared/database/model/cufs');
var router = require('koa-router')();
var koa = require('koa');
var Tree = require('dsp_shared/database/model/tree');
var crud_opts = require('../crud_op')(Tree);
var app = koa();

router.post('/workorder/:woId/trees', function *(){
  var woId = this.params.woId;
  var userId = this.req.user._id;
  var treeObj = this.request.body;
  var result = null;

  try {
    result = yield crud_opts.create(treeObj);
    result = yield crud_opts.read(result._id);
    this.body = result;

    Cuf.update({_id: userId, 'workorder._id': woId}, {'$addToSet': {'workorder.$.tasks': result._id._str}}, function(err, data){
      if(err) { console.log(err); }
      else {
        console.log('Tree ' + result._id + ' added and Workorder ' + woId + ' updated', data);
      }
    });
  } catch(e) {
    throw ('Tree not added', 500);
  }
});

router.patch('/workorder/:woId/trees/:treeId', function *(){
  var treeId = this.params.treeId;
  var treeUpdates = this.request.body;

  var result = null;

  try {
    result = yield crud_opts.patch(treeId, treeUpdates, this.header['content-type']);
    this.body = result;
    this.dsp_env.msg = 'Tree Successfully Edited';
  } catch(e) {
    throw ('Tree not added', 500);
  }
});

router.delete('/workorder/:woId/trees/:treeId', function *(){
  var woId = this.params.woId;
  var treeId = this.params.treeId;
  var userId = this.req.user._id;
  var treeUpdates = this.request.body;

  var result = null;

  try {
    result = yield crud_opts.patch(treeId, treeUpdates, this.header['content-type']);
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
});

app.use(router.routes());
module.exports = app;

if (require.main === module) {
  app.listen(3000);
}
