// Third Party Module
const fs = require('fs');
const path = require('path');
const koa = require('koa');
const bodyParser = require('koa-body-parser');
const requestId = require('koa-request-id');
const session = require('koa-session');
const mount = require('koa-mount');

// Dispatchr Module
const testConfig = require('./config');
const config = require('dsp_shared/config/config').get({log4js : false});
config.meteor.mongo_db_name = 'dispatcher_unit_test';

// Connect to Database
require('dsp_shared/database/database')(config.meteor);
require('dsp_shared/database/sequelize')(config.postgres);

// Middleware
var app = koa();
app.use(bodyParser());
app.use(requestId());
app.keys = ['dispatchr_cookie::ius45jbipsdhip42oj59g'];
app.use(session({ key: 'dispatchr:sess' }, app));
app.use(require('./middleware').headerAccept);
app.use(require('./middleware').envelope);
app.use(mount('/api/test', require('../../auth/auth')));
app.use(require('./middleware').auth);

// Test Router
var routesFile = fs.readdirSync(testConfig.route_dir);
routesFile.forEach(f => {
  app.use(mount('/api/test', require(path.resolve(testConfig.route_dir, f))));
});

// Export
module.exports = app.listen(3000);