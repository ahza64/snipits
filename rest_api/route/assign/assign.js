var config = require('dsp_shared/config/config').get();
require('dsp_shared/database/database')(config.meteor);

var koa = require('koa');
var app = koa();

var router = require('koa-router')();

var bodyParser = require('koa-bodyparser');

var assignUtils = require('./assign_util');
var unassignUtils = require('./unassign_util');

router.post('/assign', function *assign(next) {
  var crew = this.request.body.crew;
  var qows = this.request.body.qows;
  var createWO = this.request.body.createWO;

  try {
    yield assignUtils.updateTrees(crew, qows);
    yield assignUtils.updateCrew(crew);
    yield assignUtils.createWO(crew, qows);
    this.body = "Done";
  } catch(e) {
    console.error('Error assigning:', e.message);
  }
  yield next;
});

router.post('/unassign', function *unassign(next) {
  var crew = this.request.body.crew;
  var project = this.request.body.project;

  try {
    console.log('Unassigning');
    yield unassignUtils.unassignTrees(project, crew);
    yield unassignUtils.unassignPmd(project, crew);
    yield unassignUtils.unassignCuf(project, crew);
    this.body = "Done";
  } catch(e) {
    console.error('Error unassigning:', e.message);
  }
  yield next;
});

app.use(router.routes());

module.exports = app;
