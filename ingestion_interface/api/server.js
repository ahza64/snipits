// Module
const koa = require('koa');
const mount = require('koa-mount');
const bodyParser = require('koa-body-parser');
const session = require('koa-session');
const cors = require('kcors');
const models = require('dsp_shared/database/model/ingestion/tables');
const authMiddleware = require('./middleware/auth');
const port = require('dsp_shared/conf.d/config').ingestionPostgres.api_port;

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
  allowMethods: ['GET', 'POST', 'PUT'],
  credentials: true
}));
app.use(bodyParser());

// Router
app.use(mount('/', require('./router/auth')));
app.use(authMiddleware);
app.use(mount('/', require('./router/upload')));
app.use(mount('/', require('./router/ingestion')));

// Port
app.listen(port);