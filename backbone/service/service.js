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

/*
 * Exception raised when attempting to use the Service before the handshake took place.
 */
function ConnectionNotReadyError(message) {
  this.message = message;
  // Use V8's native method if available, otherwise fallback
  if ("captureStackTrace" in Error){
    Error.captureStackTrace(this, ConnectionNotReadyError);
  } else {
    this.stack = (new Error()).stack;
  }
}
ConnectionNotReadyError.prototype = Object.create(Error.prototype);
ConnectionNotReadyError.prototype.name = "ConnectionNotReadyError";
ConnectionNotReadyError.prototype.constructor = ConnectionNotReadyError;


/*
 * Exception raised when a heartbeat was not received on time.
 */
function MissingHeartbeat(message) {
  this.message = message;
  // Use V8's native method if available, otherwise fallback
  if ("captureStackTrace" in Error){
    Error.captureStackTrace(this, MissingHeartbeat);
  } else{
    this.stack = (new Error()).stack;
  }
}

MissingHeartbeat.prototype = Object.create(Error.prototype);
MissingHeartbeat.prototype.name = "MissingHeartbeat";
MissingHeartbeat.prototype.constructor = MissingHeartbeat;



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
    this._tmo = null;
    this.need_handshake = true;
    this.ticker = null;
    this._delayed_cb = null;
    this.socket_connected = false;
    var self = this;
    var endpoint = this.getEndpoint();
    this._socket = zmq.socket('dealer');
    this._socket.monitor(500, 0);    
    this._socket.on('message', function(){
      var args = _.map(arguments, msgbuf => msgbuf);
      self._on_message(args);
    });    
    this._socket.on('connect', function(){
      console.log("Service Connected: ", service, endpoint);
      this.socket_connected = true;
    });    
    this._socket.on('disconnect', function(){
      console.log("Service Disconnected:  ", service, endpoint);
      this.socket_connected = false;
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



  _send_disconnect() {
     var msg = [ '', PROTO_VERSION, MESSAGE_DISCONNECT, this.service ];
     this._socket.send(msg);
     this.curr_liveness = 0;     
  }
  
  _send_heartbeat(){
    var msg = [ '', PROTO_VERSION, '\x04' ];
    this._socket.send(msg);
  }
  
  _tick(){
    var self = this;
    this.curr_liveness -= 1;
    // console.log('%.3f tick - %d' % (time.time(), self.curr_liveness);
    this._send_heartbeat();
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

  
  shutdown() {
    if(this.ticker){
      clearInterval(this.ticker);
      this.ticker = null;
      if(this._socket) {
        this._send_disconnect();
        this._socket.close();
        this.timed_out = false;
        this.need_handshake = true;
      }
    }
  }
  
  reply(envelope, msg){
    if( this.need_handshake ) {
      throw new ConnectionNotReadyError();
    }
    // prepare full message
    var to_send = envelope;
    console.log("Service Response", this.service, socketid2hex(envelope[3]), msg);
    
    if(Array.isArray(msg)) {
      to_send.push.apply(to_send, msg);
    } else {
      to_send.push(msg);
    }
    
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
        console.log("Service Request", this.service, socketid2hex(envelope[3]), msg.toString());
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

/*
 * Returns printable hex representation of a socket id.
 */
function socketid2hex(sid){
  var ret = [];
  for(var i = 0; i < sid.length; i++){
    ret.push(sid[i].toString(16));
  }
  return ret.join('').toUpperCase();
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


