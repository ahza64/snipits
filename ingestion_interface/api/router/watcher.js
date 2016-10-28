// Modules
const koa = require('koa');
const router = require('koa-router')();

// App
const app = koa();

// Collection
const Watchers = require('dsp_shared/database/model/ingestion/tables').watchers;

// Create a watcher
router.post(
  '/watchers',
  function*() {
    var body = this.request.body;
    console.log('---------------> ', body);
    
    this.throw(200);
  }
);

app.use(router.routes());

module.exports = app;