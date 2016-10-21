// Module
const koa = require('koa');
const mount = require('koa-mount');
const bodyParser = require('koa-body-parser');
const session = require('koa-session');
const cors = require('kcors');
const models = require('./model/tables');
const authMiddle = require('./middleware/auth');

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
  allowMethods: ['GET', 'POST'],
  credentials: true
}));
app.use(bodyParser());

// Router
app.use(mount('/', require('./router/auth')));
app.use(authMiddle.auth);
app.use(mount('/', require('./router/upload')));
app.use(mount('/', require('./router/company')));
app.use(mount('/', require('./router/user')));

// Port
app.listen(3000);