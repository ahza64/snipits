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
var session = require('koa-session');
var request_log = require('log4js').getLogger('request');
require('dsp_shared/database/database')(config.meteor);
require('dsp_shared/database/sequelize')(config.postgres);

var whitelist = config.corsWhitelist;
var login = require('./auth/auth');
var bodyParser = require('koa-body-parser');


var app = koa();

var corsOptions = {
  origin: function(origin, callback){
    var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
    callback(null, originIsWhitelisted);
  },
	methods: ['GET', 'PUT', 'POST', 'PATCH'],
	credentials: true
};


// middleware
// app.use(cors(corsOptions));
app.use(bodyParser());
app.use(logger());
app.use(compress());
app.use(requestId());

//set accept header
app.use(function *(next){
  var url = this.request.url;
  var header = this.request.header;
  console.log('accept header:', header.accept);
  if (url.endsWith('.jpeg') || url.endsWith('.jpg')) {
    header.accept= "image/jpeg";
    var sufix_len = url.endsWith('.jpeg') ? 5 : 4;
    this.request.url = url.substring(0, url.length-sufix_len);
  }
  if(header.accept === '*/*' || !header.accept) {
    header.accept = "application/json";
  }
  yield next;
});

//envelope middleware
app.use(function *(next){
  this.dsp_env = {
    request_id: this.id,
    request_url: this.request.url,
    host: this.request.header.host,
    method: this.request.method
  };
  yield next;
  if(this.request.header.accept === 'application/json') {
    this.body = {
      envelope: this.dsp_env,
      data: this.body
    };
  }
});

// No authentication required for these routes
app.use(mount('/api/v3', require('./route/version')));

// sessions
app.keys = ['dispatchr_cookie::ius45jbipsdhip42oj59g'];
app.use(session({ key: 'dispatchr:sess' }, app));

//Mount the login endpoint first
app.use(mount('/api/v3', login));

// Don't require login but include it
app.use(function*(next) {
  if(this.isAuthenticated()) {
    this.user = this.passport.user;
    yield next;
  } else {
    if(this.request.header.accept === 'application/json'){
      this.dsp_env.status = 400;
    }
    this.status = 400;
    this.dsp_env.msg = 'Not Authenticated!!'
  }
});

app.use(function*(next){
  var ip;
  if(this.request.connection) {
    ip = this.request.connection.remoteAddress;
  }

  var log_me = {
    method: this.method,
    host: this.request.host,
    url: this.originalUrl,
    body: this.request.body,
    user: yield Promise.resolve(this.user),
    user_ip: ip,
    "user-agent": this.request.header['user-agent']
  };
  request_log.info(JSON.stringify(log_me));

  yield next;
});

//mount each resource
_.each(resources, function(resource){
  app.use(mount('/api/v3',require('./crud_route')(resource.name, resource.options)));
});
//mount other resources
app.use(mount('/api/v3', require('./route/package')));
app.use(mount('/api/v3', require('./route/asset')));
app.use(mount('/api/v3', require('./route/update_tree')));

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
