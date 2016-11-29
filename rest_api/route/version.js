/**
* @fileOverview version for workr client
*/
if (require.main === module) {
  var config = require('dsp_shared/config/config').get();
  require('dsp_shared/database/database')(config.meteor);
}
var koa = require('koa');
var router = require('koa-router')();
var Client = require('dsp_shared/database/model/client');
var app = koa();

router.get('/client', function *() {
  try {
    var client = this.request.query.name;
    this.body = yield Client.find({name: client}).select({name:1, min_version:1, max_version:1, upgrade_url:1});
    this.dsp_env.client_name = this.body[0].name;
    this.dsp_env.status = this.status;
    } catch(e) {
    console.error('EXCEPTION: ', this.id, e.message);
    this.setError(this.errors.VERSION_ERROR);
  }
});

app.use(router.routes());
module.exports = app;

if (require.main === module) {
  app.listen(3000);
}
