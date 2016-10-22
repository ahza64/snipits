// Module
const koa = require('koa');
const mount = require('koa-mount');
const bodyParser = require('koa-body-parser');
const session = require('koa-session');
const cors = require('kcors');
const models = require('./model/tables');
const authMiddleware = require('./middleware/auth');
const port = require('./config').port;

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
app.use(authMiddleware.auth);
app.use(mount('/', require('./router/upload')));
app.use(mount('/', require('./router/company')));
app.use(mount('/', require('./router/user')));
app.use(mount('/', require('./router/ingestion')));

// Port
app.listen(port);