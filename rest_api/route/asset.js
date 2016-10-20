var config = require('dsp_shared/config/config').get();
require('dsp_shared/database/database')(config.meteor);
var koa = require('koa');
var app = koa();
require('dsp_shared/lib/starts_with');
var router = require('koa-router')();
var Asset = require('dsp_shared/database/model/assets');

var crud_opts_asset = require('../crud_op')(Asset);

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

function getJPEG(data) {
  if(data && data.startsWith("data:image/jpeg;base64,")) {
    return new Buffer(data.substring("data:image/jpeg;base64".length), "base64");
  }
  return null;
}

//Add if(read_only)
router.post('/asset', function*(next) {
  var result = null;
  try {
    result = yield crud_opts_asset.create(this.request.body);
    result = yield crud_opts_asset.read(result._id);
    this.body = {_id:result._id};
    this.status = 200;
  } catch(e) {
    console.log('Exception:', e.message);
    this.setError(this.errors.NOT_ADDED);
  }
  yield next;
});

router.get('/asset/:id', function*() {
  try {
    yield get_req(this.params.id, this);
    console.log("BASE ROUTE", this.request.header, this.request.header.accept, this.request.header.accept === 'image/jpeg');
    if(this.request.header.accept === 'image/jpeg') {
      this.body = getJPEG(this.body.data);
      this.type = "image/jpeg";
    }
  } catch(e) {
    console.log('Exception:', e.message);
    this.setError(this.errors.NOT_FOUND);
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
