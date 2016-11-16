/**
 * @fileoverview Utilities to start a command through the python command line service implementation
 */
var process = require('process');
var spawn = require('child_process').spawn;
var _ = require('underscore');



var NODE_PROCESS = 'node';

function start_node_service(service_name, node_file, options, host, port) {
  options = options || {};
  options.argv = options.argv || [];
  options.argv.unshift(node_file);
  start_service(service_name, NODE_PROCESS, options, host, port);
}

function compose_message(options) {
  var message = [];
  for(var key in options) {
    if(options.hasOwnProperty(key)) {
      message.push("--"+key);
      message.push(options[key]);
    }
  }  
  return message;
}


/**
 * 
 */
function start_service(service_name, command, options, host, port) {
  var py_options = ['host', 'port'];
  var cmd_argv;
  
  if(Array.isArray(options)) {
    py_options = {};
    cmd_argv = options;
  } else {
    cmd_argv = options.argv || [];
    var test = compose_message(_.omit(options, py_options.concat('argv')));
    cmd_argv.push.apply(cmd_argv, test);
    py_options   = _.pick(options, py_options);
  }
  
  if(host) {
    py_options.host = host;
  }
  if(port) {
    py_options.port = port;
  }
  var py_argv = compose_message(py_options);
  
  var full_argv = [];
  full_argv.push('-u');  
  full_argv.push('-m');  
  full_argv.push('backbone.service'); 
  full_argv.push.apply(full_argv, py_argv);  
  full_argv.push(service_name);  
  full_argv.push(command);  
  full_argv.push.apply(full_argv, cmd_argv);  
  
  
  // console.log(["python"].concat(full_argv).join(' '));
  var child = spawn('python', full_argv);
  
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
  
}

module.exports = {
  start: start_service,
  start_node: start_node_service
};


if (require.main === module) {
  var baker = require('dsp_shared/lib/baker');  
  baker.command(start_service, {default: true, opts: 'options', command: 'start'});
  baker.command(start_node_service, {opts: 'options', command: 'start_node'});
  baker.run();
}

// if (require.main === module) {
//   var params = process.argv.slice(2);
//   console.log("LLLLLLL", params);
//   var service_name = params.shift();
//   var command = params.shift();
//
//
// }