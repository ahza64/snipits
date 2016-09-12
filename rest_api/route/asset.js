var config = require('dsp_shared/config/config').get();
require('dsp_shared/database/database')(config.meteor);
var koa = require('koa');
var app = koa();
require('dsp_shared/lib/starts_with');
var router = require('koa-router')();
var Asset = require('dsp_shared/database/model/assets');
var Tree = require('dsp_shared/database/model/tree');
var crud_opts_asset = require('../crud_op')(Asset);
var crud_opts_tree = require('../crud_op')(Tree);
var TreeHistory = require('dsp_shared/database/model/tree-history');

var bodyParser = require('koa-bodyparser');

function *get_req(id, response) {
  var data;
  try {
    if(id===undefined) {
      var offset = response.request.query.offset || 0;
      var len = response.request.query.length || 100; // Need to manage this on the client we can't always get all of them

      data = yield crud_opts_asset.list(offset, len, undefined, response.request.query.select);
    } else {
      data = yield crud_opts_asset.read(id, response.query);
    }
  } catch (e){
    if(e.name === "CastError" && e.path === '_id') {
      response.throw("Bad Resource ID", 400);
    } else {
      console.warn('Unhandled Error', e);
    }
  }
  if(data) {
    response.body = data;
  } else {
    response.throw("Resource Not Found", 404);
  }
}

/**
* @param { String } id - user id
*/

router.get('/asset/:id.jpg', function*() {
  yield get_req(this.params.id, this);

  if(this.body.data && this.body.data.startsWith("data:image/jpeg;base64,")) {
    this.body = new Buffer(this.body.data.substring("data:image/jpeg;base64".length), "base64");
    this.type = "image/jpeg";
  }
});

router.get('/asset/:id.jpeg', function*() {
  yield get_req(this.params.id, this);

  if(this.body.data && this.body.data.startsWith("data:image/jpeg;base64,")) {
    this.body = new Buffer(this.body.data.substring("data:image/jpeg;base64".length), "base64");
    this.type = "image/jpeg";
  }
});

//Add if(read_only)
router.post('/asset', function*(next) {
  var result = null;
  var updateTree = null;
  var treeId;
  var imageType;
  var update = {};
  try {
    result = yield crud_opts_asset.create(this.request.body);
    result = yield crud_opts_asset.read(result._id);
    treeId = result.ressourceId;
    console.log("result", result, "treeid", treeId);
    console.log("A----");
    var tree = yield Tree.findOne({_id : treeId});
    console.log(tree);
    imageType = result.meta.imageType;
    update[imageType] = result._id;
    console.log("B----");
    updateTree = yield crud_opts_tree.patch(treeId, update, this.header['content-type']);
    console.log("C----");
    console.log(updateTree);
    yield TreeHistory.recordTreeHistory(tree, updateTree, this.req.user);
    console.log("D----");
    this.body = {_id:result._id};
    this.status = 200;
  } catch(e) {
    throw ('not work', 500);
  }
  yield next;
});

router.get('/asset/:id', function*() {
  yield get_req(this.params.id, this);

  if(this.body.data && this.body.data.startsWith("data:image/jpeg;base64,")) {
    var imgStr = this.body.data.substring("data:image/jpeg;base64".length);
    var buf = new Buffer(imgStr, 'base64');
    this.type = "image/jpeg";
    this.body = buf;
  }
});


app.use(router.routes());

module.exports = app;

//This is runnable as a stand alone server
if(require.main === module) {
  app.use(bodyParser());
  var logger = require('koa-logger');
  app.use(logger());
  app.listen(3002);
}
