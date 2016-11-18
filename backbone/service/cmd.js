"use strict";
/**
 * @fileoverview Service that takes a command line and arguments and turns it into a service
 * @author <gabe@dispatchr.co> (Gabriel Littman)
 */


var Service = require('./service');
var exec = require('child_process').exec;

class CmdService extends Service {
  /**
   * @constructor
   * @param {String} service name of the service
   * @param {String} cmd name of the programe to run
   * @param {String} host host name or ip of broker 
   * @param {String} port port to for service to connect to
   * @param {Array} options list or command line options to add to command
   */
  constructor(service, cmd, host, port, options) {
    console.log("CmdService", service, host, port, cmd, options);
    super(service, function(msg, reply){
      
      var full_cmd = options.concat(msg);
      full_cmd.unshift(cmd);
      full_cmd = full_cmd.join(' ');
      
      console.log("COMMAND", full_cmd);
      exec(full_cmd, function(error, stdout, stderr) {
          if(error) {
            reply(["Error", error]);
            console.error("error", error);
            console.error(`stderr: ${stderr}`);
          } else {
            reply(stdout);
          }          
      });
    }, {host: host, port: port});
  }
    
  
}

function service(name, cmd, args, opts){
  // console.log("service", name, cmd, args, opts);
  var host = opts.host;
  var port = opts.port;
  
  delete opts.host;
  delete opts.port;
  
  host = host || "127.0.0.1";
  port = port || "5555";

  for(var key in opts) {
    if(opts.hasOwnProperty(key)) {
      if(key.length === 1) {
        args.push('-'+key);
      } else {
        args.push('--'+key);
      }
      var val = opts[key];
      if(val !== true && val !== false) {
        args.push(val);
      }
    }
  }
  var worker = new CmdService(name, cmd, host, port, args);
  worker.connect();   
}

function run() {
  var baker = require('dsp_shared/lib/baker');  
  baker.command(service, {args: "args", opts: "opts", default: true});
  baker.run();  
}

module.exports = {CmdService: CmdService, run: run};

if (require.main === module) {
  run();
}
