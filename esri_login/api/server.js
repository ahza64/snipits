//Modules
const koa = require('koa');
const mount = require('koa-mount');
const logger = require('koa-logger')
const config = require('../../shared/conf.d/config').esri_login;
const port = config.api_port;

//App
const app = koa();
app.use(logger());

//Router
app.use(mount(config.url_prefix, require('./Oauth')));

//Port
console.log('app listening on port: ' + port);
app.listen(port);
