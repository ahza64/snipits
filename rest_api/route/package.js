/**
* @fileOverview package for mobile client
*/

var config = require('dsp_shared/config/config').get();
require('dsp_shared/database/database')(config.meteor);
var router = require('koa-router')();
var koa = require('koa');
var cufs = require('dsp_shared/database/model/cufs');
var trees = require('dsp_shared/database/model/tree');
var app = koa();
const assert = require('assert');

router.get('/client/workr/n1/package/:id', function*() {
    var cufID = this.params.id;
    var cuf = yield cufs.findOne({
        _id: cufID
    });
    var cufInfo = {};
    cufInfo.trees = {};
    cufInfo.workorders = [];
    for (var i = 0; i < cuf.workorder.length; ++i) {
        cufInfo.workorders.push(cuf.workorder[i]);
        for (var j = 0; j < cuf.workorder[i].tasks.length; ++j) {
            var treeid = cuf.workorder[i].tasks[j];
            cufInfo.trees[treeid] = yield trees.findOne({
                _id: treeid
            });
        }
    }
    this.body = cufInfo;
});
app.use(router.routes());
app.listen(3000);
module.exports = app;
