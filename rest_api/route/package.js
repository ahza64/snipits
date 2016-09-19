/**
* @fileOverview package for mobile client
*/
if (require.main === module) {
  var config = require('dsp_shared/config/config').get();
  require('dsp_shared/database/database')(config.meteor);
}
const MIN_DISTANCE = 0.125; //in miles
var koa = require('koa');
var router = require('koa-router')();
var Cuf = require('dsp_shared/database/model/cufs');
var Tree = require('dsp_shared/database/model/tree');
var MapFeature = require('dsp_shared/database/model/mapfeatures');
var _ = require("underscore");
var app = koa();

//Things to test
// cuf_id must exist
function* extractCircuitNamesFromWO(workorder) {
  var treesInWO = yield Tree.find({_id: {$in: workorder.tasks}});
  var circuitNamesInWO = yield treesInWO.map(function (x) {
    return x.circuit_name;
  });
  return yield _.uniq(circuitNamesInWO);
}
router.get('/workr/package', function*() {

  try{

    var cuf = this.req.user;
    var workorders = cuf.workorder;
    var map_features =[];
    var tree_ids = [];
    for (var i = 0; i < workorders.length; ++i) {
        var workorder = workorders[i];
        tree_ids = tree_ids.concat(workorder.tasks);
        var features = yield MapFeature.findNear(workorder.location, MIN_DISTANCE, 'miles', { type: "alert" });
        map_features = map_features.concat(features);
        workorder.circuit_names = yield extractCircuitNamesFromWO(workorder);
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
      work_type: cuf.work_type[0]
    };

    //timestamp for last time the assignment changed
    var lastUpdated = cuf.last_sent_at;

    this.body = {
      updated: lastUpdated,
      user: userObject,
      workorders: workorders,
      trees: trees,
      map_features: map_features
    };
  } catch(e) {
    console.log('Exception: ', e.message);
    this.dsp_env.msg = 'Error';
    this.dsp_env.error = e.message;
    this.status = 500;
  }
});

app.use(router.routes());
module.exports = app;

if (require.main === module) {
  app.listen(3000);
}
