/**
* @fileOverview package for mobile client
*/
if (require.main === module) {
  var config = require('dsp_shared/config/config').get();
  require('dsp_shared/database/database')(config.meteor);
}
const MIN_DISTANCE = 0.062; //in miles
var koa = require('koa');
var router = require('koa-router')();
var User = require('dsp_shared/database/model/cufs');
var Tree = require('dsp_shared/database/model/tree');
var MapFeature = require('dsp_shared/database/model/mapfeatures');
var _ = require("underscore");
var config = require('../routes_config').package.exclude;
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
    var tree_exclude = {};
    var user_exclude = {};

    //fields to exclude from the workorders
    _.each(config.workorder, field => {
      user_exclude[field] = 0;
    });

    //fields to exclude from trees
    _.each(config.tree, field => {
      tree_exclude[field] = 0;
    });

    var userId = this.passport.user._id;
    var user = yield User.findOne({_id: userId}).select(user_exclude);

    //filter out workorders with no trees
    var workorders = user.workorder.filter(wo => wo.tasks.length !== 0);

    var map_features =[];
    var tree_ids = [];

    for (var i = 0; i < workorders.length; ++i) {
        var workorder = workorders[i];
        tree_ids = tree_ids.concat(workorder.tasks);
        var features = yield MapFeature.findNear(workorder.location, MIN_DISTANCE, 'miles', { type: "alert" }, config.mapfeature);
        map_features = map_features.concat(features);
        if(!workorder.circuit_names){
          workorder.circuit_names = yield extractCircuitNamesFromWO(workorder);
        }
    }

    //optimizaton - make one db request for trees
    var trees = yield Tree.find({_id: {$in: tree_ids}, status:/^[^06]/}).select(tree_exclude);
    this.dsp_env.workorders = workorders.length;
    this.dsp_env.trees = trees.length;
    this.dsp_env.map_features = map_features.length;

    var userObject = {
      _id: user._id,
      first: user.first,
      last: user.last,
      work_type: user.work_type[0]
    };

    //timestamp for last time the assignment changed
    var lastUpdated = user.last_sent_at;

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
    this.dsp_env.status = 500;
  }
});

app.use(router.routes());
module.exports = app;

if (require.main === module) {
  app.listen(3000);
}
