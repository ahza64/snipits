/**
* Module dependencies.
* @fileOverview app.js
*/
var _ = require('underscore');
var config = require('dsp_shared/config/config').get();
var log = require('log4js').getLogger('['+__filename+']');
var logger = require('koa-logger');
var compress = require('koa-compress');
var mount = require('koa-mount');
var koa = require('koa');
var cors = require('koa-cors');
var resources = require('./resources.json');
var requestId = require('koa-request-id');
require('dsp_shared/database/database')(config.meteor);
var whitelist = config.corsWhitelist;
var corsOptions = {
  origin: function(origin, callback){
    var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
    callback(null, originIsWhitelisted);
  },
	methods: ['GET', 'PUT', 'POST', 'PATCH'],
	credentials: true
};
var app = koa();

// middleware
// app.use(cors(corsOptions));
app.use(logger());
app.use(compress());
app.use(requestId());

//envelope middleware
app.use(function *(next){
  this.dsp_env = {
    request_id: this.id,
    request_url: this.request.url,
    host: this.request.header.host,
    method: this.request.method
  };
  yield next;
  console.log(this.request);
  this.body = {
    envelope: this.dsp_env,
    data: this.body
  };
});

//mount each resource
_.each(resources, function(resource){
  app.use(mount('/api/v3',require('./crud_route')(resource.name, resource.options)));
});

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
