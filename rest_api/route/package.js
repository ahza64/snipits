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
var MapFeatures = require('dsp_shared/database/model/mapfeatures')
var _ = require("underscore");
var app = koa();

//Things to test
// cuf_id must exist

// Eventually need to get cuf_id from login

router.get('/client/workr/n1/package', function*() {

    var query = this.request.query;
    var cufID = query.cuf_id;
    var offset = parseInt(query.offset) || 0;
    var length = parseInt(query.length) || 5000;

    var cuf = yield Cuf.findOne({
        _id: cufID
    });

    var tree_ids = [];
    var workorders = [];
    var cufWOs = cuf.workorder;
    var numberOfTrees = 0;
    var skipped = 0;

    for (var i = 0; i < cufWOs.length && numberOfTrees < length; i++) {
        var aWorkorder = cufWOs[i];
        var tree_list = aWorkorder.tasks;
        if (skipped > offset) {
            workorders.push(aWorkorder);
        }
        for (var j = 0; j < tree_list.length && numberOfTrees < length; j++) {
            if (skipped < offset) {
                skipped++;
                continue;
            } else if (skipped === offset) {
                workorders.push(aWorkorder);
                skipped++;
            }
            tree_ids.push(tree_list[j]);
            numberOfTrees++;
        }
    }

    var trees = yield Tree.find({_id: {$in: tree_ids}});

    this.dsp_env.length = numberOfTrees;
    this.dsp_env.offset = offset;
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
