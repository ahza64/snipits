// Modules
const koa = require('koa');
const router = require('koa-router')();
const authRole = require('../middleware/auth').authRole;

// App
const app = koa();

// Collection
const Ingestions = require('../model/tables').ingestions;

// Create a file record for ingestions
router.post(
  '/ingestions',
  function*() {

  }
);

// Set ingestion / ingested notification
router.put(
  '/ingestions',
  authRole,
  function*() {

  }
);

// Get files status
router.get(
  '/ingestions',
  function*() {

  }
);

app.use(router.routes());

module.exports = app;