/**
* Module dependencies.
* @fileOverview app.js
*/
var config = require('dsp_shared/config/config').get();
var log = require('log4js').getLogger('['+__filename+']');
var logger = require('koa-logger');
var compress = require('koa-compress');
var mount = require('koa-mount');
var koa = require('koa');
var cors = require('koa-cors');

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


console.log("Mounting API V3");
var resources = ["tree", "circuit", "pmd"];
for(var i = 0; i < resources.length; i++) {
  app.use(mount('/api/v3',require('./crud_route')(resources[i], {read_only: true})));
}



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
