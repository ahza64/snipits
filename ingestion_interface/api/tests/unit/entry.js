// Third Party Module
const fs = require('fs');
const path = require('path');
const koa = require('koa');
const bodyParser = require('koa-body-parser');
const requestId = require('koa-request-id');
const session = require('koa-session');
const mount = require('koa-mount');
const models = require('dsp_shared/database/model/ingestion/tables');

// Dispatchr Module
const testConfig = require('./config');
const config = require('dsp_shared/config/config').get({log4js : false});
const auth = require('../../middleware/auth');

require('dsp_shared/database/sequelize')(config.mooncake);

var app = koa();
models.sequelize.sync().then(function() {
  console.log('Database Connected');
});

models.sequelize.sync().then(function() {
  console.log('Database Connected');
});

app.use(bodyParser());
app.use(requestId());

app.keys = ['dispatchr_cookie::ius45jbipsdhip42oj59g'];
app.use(session({ key: 'dispatchr:sess' }, app));

// console.log("FILENAME", __filename);
// console.log("asdf", path.dirname(__filename) + "/" + testConfig.route_dir);

app.use(mount(testConfig.BASE_URL, require(testConfig.route_dir + '/auth')));
app.use(auth);
app.use(mount(testConfig.BASE_URL, require(testConfig.route_dir + '/config')));
app.use(mount(testConfig.BASE_URL, require(testConfig.route_dir + '/project')));
app.use(mount(testConfig.BASE_URL, require(testConfig.route_dir + '/ingestion')));
app.use(mount(testConfig.BASE_URL, require(testConfig.route_dir + '/upload')));
app.use(mount(testConfig.BASE_URL, require(testConfig.route_dir + '/history')));

module.exports = app.listen(3000);
