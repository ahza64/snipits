// Modules
const koa = require('koa');
const mount = require('koa-mount');
const bodyParser = require('koa-body-parser');
const session = require('koa-session');
const cors = require('kcors');

// Config
const config = require('dsp_shared/config/config').get();

// App
const app = koa();

// Database
require('dsp_shared/database/database')(config.platform);

// Middleware
app.keys = ['dispatchr_cookie::ius45jbipsdhip42oj59g'];
app.use(session({ key: 'dispatchr:sess' }, app));
app.use(cors({
  origin: 'http://localhost:8080',
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(bodyParser());

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
app.use(mount('/', require('./upload')));

// Port
app.listen(3000);