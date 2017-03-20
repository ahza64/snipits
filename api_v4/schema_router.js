const koa = require('koa');
const router = require('koa-router')();
const app = koa();
const Schema = require('dsp_shared/database/model/schema');

router.get('/schemas', function *getSchemas() {
  console.log('get the request');
  try {
    let schemas = yield Schema.find({});
    this.body = schemas;
  } catch(e) {
    this.status = 500;
  }
});

app.use(router.routes());

module.exports = app;