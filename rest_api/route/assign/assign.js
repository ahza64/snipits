var config = require('dsp_shared/config/config').get();
require('dsp_shared/database/database')(config.meteor);

var koa = require('koa');
var app = koa();

var router = require('koa-router')();

var bodyParser = require('koa-bodyparser');

var assignUtils = require('./assign_util');

router.post('/assign', function *assign(next) {
  var crew = this.request.body.crew;
  var qows = this.request.body.qows;
  var createWO = this.request.body.createWO;

  yield assignUtils.updateTrees(crew, qows);
  yield assignUtils.updateCrew(crew);
  yield assignUtils.createWO(crew, qows);
  this.body = "Done";

  yield next;
});

app.use(router.routes());

module.exports = app;
