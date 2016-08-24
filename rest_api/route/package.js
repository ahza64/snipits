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
var app = koa();
var _ = require("underscore");

//Things to test
// cuf_id must exist

// Eventually need to get cuf_id from login

router.get('/client/workr/n1/package', function*() {
    console.log("query-----------------", this.request.query);
    var cufID = this.request.query.cuf_id;
    // var offset = this.request.query.offset;
    // var length = this.request.query.length;
    var cuf = yield Cuf.findOne({
        _id: cufID
    });
    this.body = {
      workorders: cuf.workorder,
    };

    //handle query.length query.offset into workorders
    var workorders = this.body.workorders;

    // workorders = workorders.slice(offset, length);

    var tree_ids = [];
    for (var i = 0; i < workorders.length; ++i) {
        tree_ids = tree_ids.concat(workorders[i].tasks);
    }

    //optimizaton - make one db request for trees
    var trees = yield Tree.find({_id: {$in: tree_ids}});
    this.body = {
      workorders: workorders,
      trees: _.indexBy(trees, tree => tree._id.toString())
    };

});

app.use(router.routes());
module.exports = app;

if (require.main === module) {
  app.listen(3000);
}
