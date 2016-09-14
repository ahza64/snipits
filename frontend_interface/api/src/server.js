// Modules
const koa = require('koa');
const mount = require('koa-mount');
var bodyParser = require('koa-body-parser');
var session = require('koa-session');

// Config
const config = require('dsp_shared/config/config').get();

// App
const app = koa();

// Database
require('dsp_shared/database/database')(config.platform);

// Middleware
app.keys = ['dispatchr_cookie::ius45jbipsdhip42oj59g'];
app.use(session({ key: 'dispatchr:sess' }, app));
app.use(bodyParser());
app.use(function* (next) {
  this.body = 'This is dispatchr web service api server';
  yield next;
});

// Routes
app.use(mount('/', require('./auth')));
app.use(function*(next) {
  if(this.isAuthenticated()) {
    this.user = this.passport.user;
    yield next;
  } else {
    this.throw(401);
  }  
});

// Port
app.listen(3000);