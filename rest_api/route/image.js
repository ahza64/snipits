// var log = require('log4js').getLogger('['+__filename +']');
var config = require('dsp_shared/config/config').get();
require('dsp_shared/database/database')(config.meteor);
var koa = require('koa');
var router = require('koa-router')();

require('dsp_shared/lib/starts_with');
var Asset = require('dsp_shared/database/model/assets');
var crud_opts = require('../crud_op')(Asset);
var bodyParser = require('koa-bodyparser');
var app = koa();

app.use(bodyParser());

function *get_req(id, response) {
  var data;
  try {
    if(id===undefined) {
      var offset = response.request.query.offset || 0;
      var len = response.request.query.length || 100;  // Need to manage this on the client we can't always get all of them


      data = yield crud_opts.list(offset, len, undefined, response.request.query.select);
    } else {
      data = yield crud_opts.read(id, response.query);
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

router.get('/asset/:id.jpg', function *() {
  yield get_req(this.params.id, this);

  if(this.body.data && this.body.data.startsWith("data:image/jpeg;base64,")) {
    this.body = new Buffer(this.body.data.substring("data:image/jpeg;base64".length), "base64");
    this.type = "image/jpeg";
  }
});
router.get('/asset/:id.jpeg', function *() {
  yield get_req(this.params.id, this);

  if(this.body.data && this.body.data.startsWith("data:image/jpeg;base64,")) {
    this.body = new Buffer(this.body.data.substring("data:image/jpeg;base64".length), "base64");
    this.type = "image/jpeg";
  }
});

router.post('/asset', function *(next) {
  var result = null;
  try {
    result = yield crud_opts.create(this.request.body);
    result = yield crud_opts.read(result._id);
    this.body = result;
    this.status = 200;
  } catch (e){
    throw('not work', 500);
  }
  yield next;
});

app.use(router.routes());


module.exports = app;

//This is runnable as a stand alone server
if (require.main === module) {
    //initalize database
	var logger = require('koa-logger');
	app.use(logger());
  app.listen(3002);
}
