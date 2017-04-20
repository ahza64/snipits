// logging
const log4js = require('log4js');
const jsonLayout = require('log4js-json-layout');
log4js.layouts.addLayout('json', jsonLayout);
appenders = [{
    type: 'console',
    layout: {
        type: 'json',
    }
  }
];
log4js.configure({
  appenders: appenders,
  replaceConsole: true
});

// Module
const koa = require('koa');
const mount = require('koa-mount');
const bodyParser = require('koa-body-parser');
const session = require('koa-session');
const cors = require('kcors');
const models = require('dsp_shared/database/model/ingestion/tables');
const authMiddleware = require('./middleware/auth');
const config = require('dsp_shared/conf.d/config').mooncake;
const port = config.api_port;
const serve = require('koa-static');

// App
const app = koa();

app.use(serve('/home/ubuntu/services/ingestion_interface/app/build/'));

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
app.use(mount(config.url_prefix, require('./router/auth')));
app.use(authMiddleware);
app.use(mount(config.url_prefix, require('./router/upload')));
app.use(mount(config.url_prefix, require('./router/ingestion')));
app.use(mount(config.url_prefix, require('./router/history')));
app.use(mount(config.url_prefix, require('./router/project')));
app.use(mount(config.url_prefix, require('./router/config')));

// Port
app.listen(port);
