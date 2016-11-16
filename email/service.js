var service = require('dsp_backbone/service/node/service');
var BackboneClient = require('dsp_backbone/client/node/client');
var _ = require('underscore');
var path = require('path');

var SERVICE_NAME = 'email';

function request(options){
  var timeout = options.timeout;
  var client = options.client;
  var disconnect = options.disconnect;
  
  
  if(disconnect === undefined) {
    disconnect = (options.client ? false : true);
  }
  
  if(!client) {
    client = new BackboneClient(options.host, options.port);
    client.connect();    
  }
  
  options = _.omit(options, ['client', 'host', 'port', 'timeout', 'disconnect']);
  var message = compose_message(options);
  
  return client.send(SERVICE_NAME, message, timeout).finally(() => {
    if(disconnect) {
      client.disconnect();
    }
  });
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


function start(host, port, opts) {
  var mail_cmd_file = path.dirname(__filename)+'/create_mail.js';
  service.start_node(SERVICE_NAME, mail_cmd_file, opts, host, port);
}

if (require.main === module) {
  var baker = require('dsp_shared/lib/baker');  
  baker.command(request, {default: true, opts: 'options'});
  baker.command(start, {});
  baker.run();
}
