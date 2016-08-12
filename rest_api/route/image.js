// var log = require('log4js').getLogger('['+__filename +']');
var koa = require('koa');
var router = require('koa-router');
var app = koa();
require('../../lib/starts_with');
app.use(router(app));

var Asset = require('../../model/asset');
var crud_opts = require('../../model/crud')(Asset);

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

app.get('/asset/:id.jpg', function *() {
  yield get_req(this.params.id, this);
  
  if(this.body.data && this.body.data.startsWith("data:image/jpeg;base64,")) {
    this.body = new Buffer(this.body.data.substring("data:image/jpeg;base64".length), "base64");
    this.type = "image/jpeg";
  }
});
app.get('/asset/:id.jpeg', function *() {
  yield get_req(this.params.id, this);
  
  if(this.body.data && this.body.data.startsWith("data:image/jpeg;base64,")) {
    this.body = new Buffer(this.body.data.substring("data:image/jpeg;base64".length), "base64");
    this.type = "image/jpeg";
  }
});


module.exports = app;

//This is runnable as a stand alone server
if (require.main === module) {
    //initalize database
  var mount = require('koa-mount');
  var config = require('../../config/config.js');
  require('../../model/database')(config);
    
	var logger = require('koa-logger');
	var wrapper = koa();
	wrapper.use(logger());
	wrapper.use(mount('/', app));
    wrapper.listen(3002);
}
