const koa = require('koa');
const logger = require('koa-logger');
const mount = require('koa-mount');
const cors = require('kcors');
const co = require('co');
const config = require('dsp_shared/config/config').get();
require('dsp_shared/database/database')(config.schema);
const Schema = require('dsp_shared/database/model/schema');
const Resource = require('dsp_shared/lib/resource');
const router = require('./resource_router');
const http = require('http');

co(function *build_app() {
  const app = koa();
  app.use(logger());
  app.use(cors({
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true
  }));
  app.use(mount('/api/v4', require('./schema_router')));
  const schemas = yield Schema.find({ _api: "v4" });  
  for (let i = 0; i < schemas.length; i++) {
    console.log("SCHEMAS", schemas[i]);
    let resource = null;

    if (schemas[i].getModel) {
      const Model = schemas[i].getModel();
      resource = new Resource(Model);
    } else if (schemas[i].getResource) {
      resource = schemas[i].getResource();
    }
    if (resource) {
      const routes = router(resource);
      console.log("ROUTES", resource.getName());
      app.use(mount('/api/v4', routes));
    }
  }

  // This is runnable as a stand alone server
  if (require.main === module) {
      // initalize database
    console.log("app config", { env: app.env, port: config.api_port });
    let server;
    if (config.api_port === 80) {
      server = http.createServer(app.callback()).listen(80);
      console.log('Starting server on port 80');
    } else {
      server = http.Server(app.callback());
      server.listen(config.api_port);
    }
    if (config.api_port < 1024 && !config.run_as_root) {
          // drop root privledges
      try {
        console.log(`Old User ID: ${process.getuid()}, Old Group ID: ${process.getgid()}`);
        process.setgid('dsp');
        process.setuid('dsp');
        console.log(`New User ID: ${process.getuid()}, New Group ID: ${process.getgid()}`);
      } catch (err) {
        console.log('Cowardly refusing to keep the process alive as root.');
        process.exit(1);
      }
    }
  }
}).catch((e) => {
  console.error("application error", e.message, e.stack);
});
