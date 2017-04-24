const koa = require('koa');
const router = require('koa-router')();
const app = koa();
const _ = require('underscore');
const Schema = require('dsp_shared/database/model/schema');

router.get('/schemas', function *getSchemas() {
  try {
    const schemas = yield Schema.find({});
    this.body = schemas.map(schema => _.omit(schema, ['_storage']));
  } catch(e) {
    this.status = 500;
  }
});

app.use(router.routes());

module.exports = app;
