// Module
const koa = require('koa');
const mount = require('koa-mount');
const bodyParser = require('koa-body-parser');
const logger = require('koa-logger')
const session = require('koa-session');
const cors = require('kcors');
const models = require('dsp_shared/database/model/ingestion/tables');
const authMiddleware = require('./middleware/auth');
const config = require('dsp_shared/conf.d/config').admin;
const port = config.api_port;

// App
const app = koa();

app.use(logger());

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
config.url_prefix = config.url_prefix.substring(0, config.url_prefix.length-1) ;
console.log("mounting to ", config.url_prefix);
app.use(mount(config.url_prefix, require('./router/auth')));
app.use(authMiddleware);
app.use(mount(config.url_prefix, require('./router/company')));
app.use(mount(config.url_prefix, require('./router/user')));
app.use(mount(config.url_prefix, require('./router/ingestion')));
app.use(mount(config.url_prefix, require('./router/projects')));
app.use(mount(config.url_prefix, require('./router/watcher')));
app.use(mount(config.url_prefix, require('./router/config')));
app.use(mount(config.url_prefix, require('./router/download')));
app.use(mount(config.url_prefix, require('./router/schema')));
app.use(mount(config.url_prefix, require('./router/taxonomy')));


// Port
console.log('app listening on port ' + port);
app.listen(port);
