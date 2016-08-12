/**
 * @fileOverview  Contains the entry point for the app
 */

require('dotenv').config();

var config = require('./conf.d/config');

var log4js = require('log4js');
log4js.configure(config.logging);
require('log4js-json-layout');
require('log4js-node-mongodb');



var logger = require('koa-logger');
var mount = require('koa-mount');
var koa = require('koa');
var bodyParser = require('koa-body-parser');
require('./models/database');
var app = koa();
app.use(logger());

app.use(bodyParser());

app.use(mount('/backups', require('./routes/home')));

app.listen(3000);

console.log('listening on port 3000');
