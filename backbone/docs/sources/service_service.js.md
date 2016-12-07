[Home](index.md)
------------------

### Classes

-   [BackboneClient](BackboneClient.md)
    -   [connect](BackboneClient.md#connect)
    -   [disconnect](BackboneClient.md#disconnect)
    -   [getEndpoint](BackboneClient.md#getEndpoint)
    -   [send](BackboneClient.md#send)
-   [BackboneClientMessage](BackboneClientMessage.md)
    -   [getReply](BackboneClientMessage.md#getReply)
    -   [parseReply](BackboneClientMessage.md#parseReply)
    -   [parseResponse](BackboneClientMessage.md#parseResponse)
    -   [serialize](BackboneClientMessage.md#serialize)
-   [BackboneService](BackboneService.md)
    -   [connect](BackboneService.md#connect)
-   [CmdService](CmdService.md)

service/service.js
==================

``` prettyprint
"use strict";
/**
 * @fileoverview This is is a generic broker woker api for javascript
 */
var zmq = require('zmq'); //https://github.com/JustinTulloss/zeromq.node/blob/master/README.md
var _ = require('underscore');

const HB_INTERVAL = 1000;  // in milliseconds
const HB_LIVENESS = 3;     // HBs to miss before connection counts as dead

const PROTO_VERSION = 'MDPW01';  //MajorDomo Protocol Woker 1

const MESSAGE_READY      = '\x01';
const MESSAGE_REQUEST    = '\x02';
const MESSAGE_REPLY      = '\x03';
const MESSAGE_HEARTBEAT  = '\x04';
const MESSAGE_DISCONNECT = '\x05';


/**
 * This function is called whenever the service recieves a message.
 * @callback BackboneService~on_request
 * @param {String|Array}                 message   Message Array
 * @param {BackboneService~reply} reply     Reply callback
 */

/**
 * This callback is sent with the message as a way to reply to the message
 * @callback BackboneService~reply
 * @param {String|Array} message         Message Array to be sent as reply to request.
 */


class BackboneService {
  /**
   * @constructor
   * @param {String}                    service      name of the service
   * @param {BackboneService~on_request} on_request - The callback that handles the response.
   * @param {Object}                    options 
   * @param {String}                    options.host host to connect to backbone
   * @param {String}                    options.port port to connect to backbone
   */  
  constructor(service, on_request, options) {
    options = options || {};
    this.host = options.host || '127.0.0.1';
    this.port = options.port || "5555";
    this.service = service;
    this.on_request = on_request;
    this.stream = null;
    this._tmo = null;
    this.need_handshake = true;
    this.ticker = null;
    this._delayed_cb = null;
    
    var self = this;
    var endpoint = this.getEndpoint();
    this._socket = zmq.socket('dealer');
    this._socket.monitor(500, 0);    
    this._socket.on('message', function(){
      var args = _.map(arguments, msgbuf => msgbuf);
      self._on_message(args);
    });    
    this._socket.on('connect', function(){
      console.log("Connected: ", endpoint);
    });    
    this._socket.on('disconnect', function(){
      console.log("Disconnected:  ", endpoint);
    });
  }
  
  getEndpoint() {
    return `tcp://${this.host}:${this.port}`;
  }
  
  /**
   * @function
   * @memberof BackboneService
   * @instance
   * @description Connect service to backbon
   */
  connect(){
    var self = this;    
    var endpoint = this.getEndpoint();
    console.log("Registering Service", this.service);
    this._socket.connect(endpoint);    
    this._send_ready();
    this.ticker = setInterval(function() {
      self._tick();
    }, HB_INTERVAL);

  }
  
  _send_ready() {
    var ready_msg = [ '', PROTO_VERSION, MESSAGE_READY, this.service ];
    this._socket.send(ready_msg);
    this.curr_liveness = HB_LIVENESS;
  }
  
  
  _tick(){
    var self = this;
    this.curr_liveness -= 1;
    // console.log('%.3f tick - %d' % (time.time(), self.curr_liveness);
    this.send_heartbeat();
    if(this.curr_liveness < 0){
      console.log('Connection Lost');
      // ouch, connection seems to be dead
      this.shutdown();
      // try to recreate it
      this._delayed_cb = setTimeout(function() {
        self.connect();
      }, 5000);
    }
  }

  send_heartbeat(){
    var msg = [ '', PROTO_VERSION, '\x04' ];
    this._socket.send(msg);
  }
  
  shutdown() {
    if(this.ticker){
      clearInterval(this.ticker);
      this.ticker = null;
      if(this.stream) {
        this._socket.close();
        this.timed_out = false;
        this.need_handshake = true;
        this.connected = true;
      }
    }
  }
  
  reply(envelope, msg){
    // if self.need_handshake:
    //   raise ConnectionNotReadyError()
    // prepare full message
    var to_send = envelope;
    if(Array.isArray(msg)) {
      to_send.push.apply(to_send, msg);
    } else {
      to_send.push(msg);
    }
    console.log("REPLY", envelope, msg);
    this._socket.send(to_send);
  }
  
  _on_message(msg) {
    var self = this;
    
    // 1st part is empty
    msg.shift();
    // 2nd part is protocol version
    // TODO: version check
    var protocol = msg.shift();
    if(protocol.toString() !== PROTO_VERSION) {
      console.error("PROTCOL VERSION MISSMATCH", protocol, PROTO_VERSION);
    } else {      
      // 3rd part is message type
      var msg_type = msg.shift().toString();
       // XXX: hardcoded message types!
       // any message resets the liveness counter
      this.need_handshake = false;
      this.curr_liveness = HB_LIVENESS;
      
      if(msg_type === MESSAGE_DISCONNECT){ // disconnect
        this.curr_liveness = 0; // reconnect will be triggered by hb timer
      } else if(msg_type === MESSAGE_REQUEST){// # request
        // remaining parts are the user message
        var split = split_address(msg);
        var envelope = split[0];
        msg = split[1];
        envelope.push('');
        envelope = [ '', PROTO_VERSION, MESSAGE_REPLY].concat(envelope); // REPLY
        msg = _.each(msg, item => item.toString());
        this.on_request(msg, function(reply_msg){          
          self.reply(envelope, reply_msg);
        });
      } else if(msg_type !== MESSAGE_HEARTBEAT) {
        console.error("Unknown Message Type", msg_type);
      } 
    }
  }
}


function split_address(msg) {
  var ret_ids = [];
  for(var i = 0; i < msg.length; i++) {
    var p = msg[i];
    if (p.length !== 0) {
      ret_ids.push(p);
    } else {
      break;
    }
  }
  return [ret_ids, msg.slice(i+1)];
}

module.exports = BackboneService;

```

Documentation generated by [JSDoc 3.4.0](https://github.com/jsdoc3/jsdoc) on Thu Nov 17 2016 16:49:04 GMT-0800 (PST) using the Minami theme.
