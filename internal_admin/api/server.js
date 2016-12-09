// Module
const koa = require('koa');
const mount = require('koa-mount');
const bodyParser = require('koa-body-parser');
const session = require('koa-session');
const cors = require('kcors');
const models = require('dsp_shared/database/model/ingestion/tables');
const authMiddleware = require('./middleware/auth');
const config = require('dsp_shared/conf.d/config').admin;
const port = config.api_port;

// App
const app = koa();

// Database
models.sequelize.sync().then(function() {
  console.log('Database Connected');
});

// Middleware
app.keys = ['dispatchr_cookie::ius45jbipsdhip42oj59g'];
app.use(session({ key: 'dispatchr:sess' }, app));
app.use(cors({
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(bodyParser());

// Router
app.use(mount(config.url_prefix, require('./router/auth')));
app.use(authMiddleware);
app.use(mount(config.url_prefix, require('./router/company')));
app.use(mount(config.url_prefix, require('./router/user')));
app.use(mount(config.url_prefix, require('./router/ingestion')));
app.use(mount(config.url_prefix, require('./router/projects')));
app.use(mount(config.url_prefix, require('./router/watcher')));
app.use(mount(config.url_prefix, require('./router/config')));

// Port
app.listen(port);
