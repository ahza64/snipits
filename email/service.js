var BackboneService = require('dsp_backbone/service');
var BackboneClient = require('dsp_backbone/client');
var mail = require('./create_mail');
var _ = require('underscore');
var co = require('co');

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
  
  var message = JSON.stringify(options);
  return client.send(SERVICE_NAME, message, timeout).then(result => {
    result[0] = JSON.parse(result[0]);
    result[2] = JSON.parse(result[2]);
    return result;
  }).finally(() => {
    if(disconnect) {
      client.disconnect();
    }
  });
}


function start(host, port, options) {
  console.log("STARTING ", SERVICE_NAME, host, port, options);
  var service = new BackboneService(SERVICE_NAME, (msg, reply) => {
    msg = JSON.parse(msg);    
    var m = co.wrap(mail);
    
    
    var params = ['to', 'from', 'template', 'subject', 'text', 'html', 'send'];
    var opts = _.extend({}, msg, options);
    var values = _.omit(opts, params);    
    opts = _.pick(opts, params);
    m(
      opts.to, 
      opts.from, 
      opts.template, 
      values,
      opts.subject, 
      opts.text, 
      opts.html, 
      opts.send
    ).then(result => {
      result[0] = JSON.stringify(result[0]);
      result[2] = JSON.stringify(result[2]);
      reply(result);
    });
    
  },{host: host, port:port});
  service.connect();
}

if (require.main === module) {
  var baker = require('dsp_shared/lib/baker');  
  baker.command(request, {default: true, opts: 'options'});
  baker.command(start, {opts: 'options'});
  baker.run();
}
