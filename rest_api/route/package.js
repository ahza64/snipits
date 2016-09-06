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

router.get('/workr/package', function*() {
    var cufID = this.req.user._id;
    // var offset = this.request.query.offset;
    // var length = this.request.query.length;
    var cuf = yield Cuf.findOne({
          _id: cufID
      });

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

    var userObject = {
      _id: cuf._id,
      first: cuf.first,
      last: cuf.last,
    };

    this.body = {
      workorders: workorders,
      trees: trees,
      user: userObject,
      map_features: map_features
    };

});

app.use(router.routes());
module.exports = app;

if (require.main === module) {
  app.listen(3000);
}
