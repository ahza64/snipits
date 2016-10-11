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
const middleware = require('../../middleware');
const error = require('../../error');
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
app.use(middleware.headerAccept);
app.use(middleware.envelope);
app.use(mount('/api/test', require('../../auth/auth')));
app.use(middleware.auth);
app.use(error);

// Test Router
console.log("FILENMAE", __filename)
console.log("asdf", path.dirname(__filename) + "/" + testConfig.route_dir)
var route_dir = path.dirname(__filename) + "/" + testConfig.route_dir;
var routesFile = fs.readdirSync(route_dir);
routesFile.forEach(f => {
  app.use(mount(testConfig.BASE_URL, require(path.resolve(route_dir, f))));
});

// Export
module.exports = app.listen(3000);
