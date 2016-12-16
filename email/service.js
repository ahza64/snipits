/**
 * @fileoverview This is a service to send email via templates and distribution lists
 * @author <gabe@dispatchr.com> (Gabriel Littman) 
 * @module email/service 
 */
var BackboneService = require('dsp_backbone/service');
var BackboneClient = require('dsp_backbone/client');

var _ = require('underscore');
var co = require('co');
var create_mail = require('./create_mail');
create_mail = co.wrap(create_mail);

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
 * @param {Boolean} options.dry_run    if ture email service will not attempt to send email and return what would have been sent
 * @param {Any}     options.{anything} any other option will be used as template values 
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
    return JSON.parse(result);
  }).finally(() => {
    if(disconnect) {
      client.disconnect();
    }
  });
}

/**
 * @function start
 * @param {String}  host               ip or host name to connect to backbone
 * @param {String}  port               port to connect to backbone
 * @param {Object}  options            options - these options will override what is sent in requests
 * @param {Object}  options.client     backbone client, if not provided client will be created
 * @param {Boolean} options.disconnect if true disconnect from client when done
 * @param {Number}  options.timeout    millisecond timeout for the request
 * @param {String}  options.to         email address or distribution list 
 * @param {String}  options.from       who is the email from
 * @param {String}  options.replyTo    who is set as reply to on the email
 * @param {String}  options.template   template name
 * @param {String}  options.subject    email subject, template takes presidence
 * @param {String}  options.text       text email body , template takes presidence
 * @param {String}  options.html       html email body, template takes presidence
 * @param {Boolean} options.dry_run    if ture email service will not attempt to send email and return what would have been sent
 * @param {Any}     options.{anything} any other option will be used as template
 */
function start(host, port, options) {
  var config = require('dsp_shared/config/config').get();  
  console.log("STARTING ", SERVICE_NAME, host, port, options);

  require('dsp_shared/database/sequelize')(config.postgres);
  var service = new BackboneService(SERVICE_NAME, (msg, reply) => {
    msg = JSON.parse(msg);    
        
    //collect all options for call
    var params = ['to', 'from', 'template', 'subject', 'text', 'html'];
    var opts = _.extend({}, msg, options);

    //handle send flag seperately
    var send = !opts.dry_run;
    delete opts.dry_run;

    
    var values = _.omit(opts, params); // select out template values
    opts = _.pick(opts, params);       // grab email options (to, from, etc)
    opts.values = values;              // add template values back
    create_mail(opts, send).then(result => {
      reply(JSON.stringify(result));
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
