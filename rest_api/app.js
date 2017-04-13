/**
* Module dependencies.
* @fileOverview app.js
*/
var _ = require('underscore');
var config = require('dsp_shared/config/config').get();
var log = config.getLogger('['+__filename+']');
var logger = require('koa-logger');
var compress = require('koa-compress');
var mount = require('koa-mount');
var koa = require('koa');
var resources = require('./resources.json');
var requestId = require('koa-request-id');
var session = require('koa-session');
require('dsp_shared/database/database')(config.meteor);
require('dsp_shared/database/sequelize')(config.postgres);
var login = require('./auth/auth');
var bodyParser = require('koa-body-parser');
var app = koa();
const cors = require('kcors');


// middleware
app.use(cors({
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true
}));
app.use(bodyParser());
app.use(cors({
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH'],
  credentials: true
}));
app.use(logger());
app.use(compress());
app.use(requestId());

//set accept header
app.use(require('./middleware').headerAccept);

//envelope middleware
app.use(require('./middleware').envelope);

//error middleware
app.use(require('./error'));

// No authentication required for these routes
app.use(mount('/api/v3', require('./route/version')));

// sessions
app.keys = ['dispatchr_cookie::ius45jbipsdhip42oj59g'];
app.use(session({ key: 'dispatchr:sess' }, app));

//Mount the login endpoint first
app.use(mount('/api/v3', login));
app.use(mount('/api/v3', require('./route/assign/assign')));
// Don't require login but include it
app.use(require('./middleware').auth);

app.use(require('./middleware').requestLog);

//mount each resource
_.each(resources, function(resource){
  app.use(mount('/api/v3',require('./crud_route')(resource.name, resource.options)));
});
//mount other resources
app.use(mount('/api/v3', require('./route/package')));
app.use(mount('/api/v3', require('./route/asset')));
app.use(mount('/api/v3', require('./route/update_tree')));
app.use(mount('/api/v3', require('./route/layer')));

//This is runnable as a stand alone server
if (require.main === module) {
    //initalize database
    log.debug("app config", {env: app.env, port:config.api_port});
    var server;
    if(config.api_port === 80) {
        var http = require('http');
        server = http.createServer(app.callback()).listen(80);
        log.info('Starting server on port 80');
    } else {
        var server = require('http').Server(app.callback());
        server.listen(config.api_port);
    }
    if(config.api_port < 1024 && !config.run_as_root) {
        //drop root privledges
        try {
            console.log('Old User ID: ' + process.getuid() + ', Old Group ID: ' + process.getgid());
            process.setgid('dsp');
            process.setuid('dsp');
            console.log('New User ID: ' + process.getuid() + ', New Group ID: ' + process.getgid());
        } catch (err) {
            console.log('Cowardly refusing to keep the process alive as root.');
            process.exit(1);
        }
    }
}
