/**
* @fileOverview package for mobile client
*/
if (require.main === module) {
  var config = require('dsp_shared/config/config').get();
  require('dsp_shared/database/database')(config.meteor);
}
var koa = require('koa');
var router = require('koa-router')();
var Cuf = require('dsp_shared/database/model/cufs');
var Tree = require('dsp_shared/database/model/tree');
var MapFeature = require('dsp_shared/database/model/mapfeatures');
var _ = require("underscore");
var app = koa();

//Things to test
// cuf_id must exist

// Eventually need to get cuf_id from login

router.get('/workr/package', function*() {
    var cufID = this.request.query.cuf_id;
    var cufEmail = this.request.query.email;
    // var offset = this.request.query.offset;
    // var length = this.request.query.length;
    var cuf = {};
    if(cufID){
      cuf = yield Cuf.findOne({
          _id: cufID
      });
    } else if(cufEmail){
      cuf = yield Cuf.findOne({
          uniq_id: cufEmail
      });
    }

    //handle query.length query.offset into workorders
    var workorders = cuf.workorder;
    var map_features =[];
    var tree_ids = [];
    for (var i = 0; i < workorders.length; ++i) {
        var workorder = workorders[i];
        tree_ids = tree_ids.concat(workorder.tasks);
        var features = yield MapFeature.findNear(workorder.location, 0.25, 'miles', { type: "alert" });
        map_features = map_features.concat(features);
    }
    
    //optimizaton - make one db request for trees
    var trees = yield Tree.find({_id: {$in: tree_ids}});
    this.dsp_env.workorders = workorders.length;
    this.dsp_env.trees = trees.length;
    this.dsp_env.map_features = map_features.length;
    this.body = {
      workorders: workorders,
      trees: _.indexBy(trees, tree => tree._id.toString()),
      map_features: map_features
    };

});

app.use(router.routes());
module.exports = app;

if (require.main === module) {
  app.listen(3000);
}
