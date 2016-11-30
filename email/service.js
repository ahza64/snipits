/**
 * @fileoverview This is a service to send email via templates and distribution lists
 * @author <gabe@dispatchr.com> (Gabriel Littman) 
 */
var BackboneService = require('dsp_backbone/service');
var BackboneClient = require('dsp_backbone/client');
var mail = require('./create_mail');
var _ = require('underscore');
var co = require('co');

var SERVICE_NAME = 'email';

/**
 * @function request
 * @param {Object}  options            options
 * @param {Object}  options.client     backbone client, if not provided client will be created
 * @param {Boolean} options.disconnect if true disconnect from client when done
 * @param {Number}  options.timeout    millisecond timeout for the request
 * @param {String}  options.to         email address or distribution list 
 * @param {String}  options.from       from who is the email from
 * @param {String}  options.template   template name
 * @param {String}  options.subject    email subject, template takes presidence
 * @param {String}  options.text       text email body , template takes presidence
 * @param {String}  options.html       html email body, template takes presidence
 * @param {Boolean} options.send       if true email service will attempt to send email else just return what would have been sent
 */
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

/**
 * @function request
 * @param {String}  host               ip or host name to connect to backbone
 * @param {String}  port               port to connect to backbone
 * @param {Object}  options            options - these options will override what is sent in requests
 * @param {Object}  options.client     backbone client, if not provided client will be created
 * @param {Boolean} options.disconnect if true disconnect from client when done
 * @param {Number}  options.timeout    millisecond timeout for the request
 * @param {String}  options.to         email address or distribution list 
 * @param {String}  options.from       from who is the email from
 * @param {String}  options.template   template name
 * @param {String}  options.subject    email subject, template takes presidence
 * @param {String}  options.text       text email body , template takes presidence
 * @param {String}  options.html       html email body, template takes presidence
 * @param {Boolean} options.send       if true email service will attempt to send email else just return what would have been sent
 */
function start(host, port, options) {
  var config = require('dsp_shared/config/config').get();  
  console.log("STARTING ", SERVICE_NAME, host, port, options);

  require('dsp_shared/database/sequelize')(config.postgres);
  var service = new BackboneService(SERVICE_NAME, (msg, reply) => {
    msg = JSON.parse(msg);    
    var m = co.wrap(mail);
    
    var send = msg.send;
    delete msg.send;
    
    var params = ['to', 'from', 'template', 'subject', 'text', 'html'];
    var opts = _.extend({}, msg, options);
    var values = _.omit(opts, params);    
    
    opts = _.pick(opts, params);
    opts.values = values;
    m(opts, send).then(result => {
      result[0] = JSON.stringify(result[0]);
      result[2] = JSON.stringify(result[2]);
      reply(result);
    });
    
  },{host: host, port:port});
  service.connect();
}

module.exports = {request: request};

if (require.main === module) {
  var baker = require('dsp_shared/lib/baker');  
  baker.command(request, {default: true, opts: 'options'});
  baker.command(start, {opts: 'options'});
  baker.run();
}
