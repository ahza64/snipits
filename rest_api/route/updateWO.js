var Cuf = require('dsp_shared/database/model/cufs');
var router = require('koa-router')();
var koa = require('koa');
var app = koa();

router.post('/wo/:woId/add/:treeId', function (){
  var woId = this.params.woId;
  var userId = this.req.user._id;
  var treeId = this.params.treeId;
  Cuf.update({_id: userId, 'workorder._id': woId}, {'$addToSet': {'workorder.$.tasks': treeId}}, function(err){
    if(err) { console.log(err); }
  });
});

router.post('/wo/:woId/remove/:treeId', function (){
  var woId = this.params.woId;
  var userId = this.req.user._id;
  var treeId = this.params.treeId;
  Cuf.update({_id: userId, 'workorder._id': woId}, {'$pull': {'workorder.$.tasks': treeId}}, function(err){
    if(err) { console.log(err); }
  });
});

app.use(router.routes());
module.exports = app;

if (require.main === module) {
  app.listen(3000);
}
