const koa = require('koa');
const mount = require('koa-mount');
var bodyParser = require('koa-body-parser');
const session = require('koa-session');
//const config = require('dsp_shared/config/config').get();

const app = koa();
//require('dsp_shared/database/database')(config.meteor);

app.use(function* (next) {
  this.body = 'This is dispatchr web service api server';
  yield next;
});

// Middleware
app.use(bodyParser());

// Routes
app.use(mount('/', require('./auth')));

app.listen(3000);