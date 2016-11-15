/**
 * @fileoverview This is is a generic broker client api for javascript
 */
var zmq = require('zmq'); //https://github.com/JustinTulloss/zeromq.node/blob/master/README.md
var baker = require('dsp_shared/lib/baker');
var BPromise = require('bluebird');
var Message = require('./mdc_protocol');

const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = '5555';


function BackboneClient(host, port) {
  this.host = host || DEFAULT_HOST;
  this.port = port || DEFAULT_PORT;
  this._socket = zmq.socket('req');
}

/**
 * get endpoint url
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
 * Sends a message to a service on the backbone
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
 *    MDP request.
 *    This function sends a request to the given service and
 *    waits for a reply.
 *
 *    If timeout is set and no reply received in the given time
 *    the function will return `None`.
 *
 *    :param socket:    zmq REQ socket to use.
 *    :type socket:     zmq.Socket
 *    :param service:   service id to send the msg to.
 *    :type service:    str
 *    :param msg:       list of message parts to send.
 *    :type msg:        list of str
 *    :param timeout:   time to wait for answer in seconds.
 *    :type timeout:    float
 *    :param cb         callbac
 *    :type cb: f
 *    :rtype list of str:
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



//baker module
if (require.main === module) {
 var baker = require('dsp_shared/lib/baker');
 baker.command(function send_message(service, message, timeout, host, port, opts){
   var full_message = [];
   for(var key in opts) {
     var opt = '';
     if(key.length > 1) {
       opt += "--";
     } else {
       opt += "-";
     }
     opt += key; 
     full_message.push(opt);
   }
   if(message) {
     full_message.push(message);
   }
   message = full_message.join(' ')
   
   var bbc = new BackboneClient(host, port);
   bbc.connect();
   return bbc.send(service, message, timeout).finally(() => {
     bbc.disconnect();
   });
 }, {opts: "opts"});
 baker.run();
}
