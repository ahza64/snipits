/**
 * @fileoverview This is is a generic broker client api for javascript
 * 
 * 
 */
var zmq = require('zmq'); //https://github.com/JustinTulloss/zeromq.node/blob/master/README.md
var BPromise = require('bluebird');
var Message = require('./mdc_protocol');

const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = '5555';

/**
 * @constructor
 * @description test {@link README.md readme}
 * @param {String}                    host   host to connect to backbone
 * @param {String}                    port   port to connect to backbone
 */  
function BackboneClient(host, port) {
  this.host = host || DEFAULT_HOST;
  this.port = port || DEFAULT_PORT;
  this._socket = zmq.socket('req');
}

/**
 * @function getEndpoint
 * @description get endpoint url
 * @memberof BackboneClient
 * @instance
 * @returns {String} The url of the endpoint
 */
BackboneClient.prototype.getEndpoint = function(){
  return `tcp://${this.host}:${this.port}`;
};

/**
 * Connect to the BackboneClient.
 */
BackboneClient.prototype.connect = function() {
  this._socket.connect(this.getEndpoint());
  
  return new BPromise((resolve, reject) =>  {
    //Events here: https://github.com/JustinTulloss/zeromq.node/blob/master/README.md
    this._socket.on('connect', () => { resolve(this); });
    this._socket.on('bind_error', () => { reject(new Error("ZMQ_EVENT_BIND_FAILED")); });
  });
};

/**
 * Disconnect this conection to the BackboneClient.
 */
BackboneClient.prototype.disconnect = function() {
  this._socket.disconnect(this.getEndpoint()); 
  
  return new BPromise((resolve, reject) =>  {
    //Events here: https://github.com/JustinTulloss/zeromq.node/blob/master/README.md
    this._socket.on('disconnect', () => { resolve(this); });
    this._socket.on('bind_error', () => { reject(new Error("ZMQ_EVENT_BIND_FAILED")); });
  });
};

/**
 * @param {String}          service name of service to send message to 
 * @param {String|Array}    port    port to connect to backbone
 * @param {Number}          timeout amount of time in milliseconds to wait for response before giving up
 *
 * @return {Promise}        response promise
 */  
BackboneClient.prototype.send = function(service, message, timeout) {
  message = message || [];
  timeout = timeout || 3000;
  if(!Array.isArray(message)) {
    message = [message];
  }
  
  return new BPromise((resolve, reject) => {
    var timer = null;
    
    //setup timeout if needed
    if(timeout) {
      timeout = parseInt(timeout);
      if(timeout > 0) {
        timer = setTimeout(() => {
          timer = -1; //timed out
          reject("Request Timeout");
        },timeout);            
      }      
    }
    
    //send request
    mdp_request(this._socket, service, message, timeout, function(reply) {
      // console.log("GOT REPLY", service, message, reply);
      if(timer !== -1) { //not timed out 
         resolve(reply); 
      }
      if(timer) {
        clearTimeout(timer);
      }
    });
  });  
};



/**
 * @function mdp_request
 * @private
 * @description MDP request.
 *    This function sends a request to the given service and
 *    waits for a reply.
 *
 *    If timeout is set and no reply received in the given time
 *    the function will return `None`.
 *
 * @param {Object} socket    zmq REQ socket to use. zmq.Socket
 * @param {String} service   service id to send the msg to.
 * @param {String} msg       list of message parts to send.
 * @param {Number} timeout    time to wait for answer in milliseconds.
 * @param {Function} cb       callback
 */
function mdp_request(socket, service, msg, timeout, cb) {
    if(!timeout || timeout < 0.0) {
      timeout = null;
    }            
    var to_send = new Message(service, msg);
    socket.send(to_send.serialize());

    socket.on('message', function() {//prot_ver, service) {
      var reply = to_send.parseReply(arguments);
      cb(reply);
    });
}


module.exports = BackboneClient;




