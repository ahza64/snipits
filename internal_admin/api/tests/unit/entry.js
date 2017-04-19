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
const auth = require('../../middleware/auth');

require('dsp_shared/database/sequelize')(config.mooncake);

var app = koa();

app.use(bodyParser());
app.use(requestId());

app.keys = ['dispatchr_cookie::ius45jbipsdhip42oj59g'];
app.use(session({ key: 'dispatchr:sess' }, app));

console.log("FILENAME", __filename);
console.log("asdf", path.dirname(__filename) + "/" + testConfig.route_dir);

app.use(auth);

var routesFile = fs.readdirSync(testConfig.route_dir);
routesFile.forEach(f => {
  app.use(mount(testConfig.BASE_URL, require(path.resolve(route_dir, f))));
});

module.exports = app.listen(3000);
