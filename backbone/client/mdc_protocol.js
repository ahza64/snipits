/**
 * MajorDomo Client Protocol
 */

var _ = require("underscore");
const PROTOCOL_VERSION = "MDPC01"; //Major Domo Protocol


var Message = function(service, message){
  this.protocol = PROTOCOL_VERSION;
  this.service = service;
  this.message = message;
};

Message.prototype.serialize = function() {
  var raw_message = this.message;
  if(!Array.isArray(raw_message)) {
    raw_message = [raw_message];
  }
  raw_message = [this.protocol, this.service].concat(raw_message);
  return raw_message;
};

/**
 * @function parseReply - Parses reply to this message
 * @param {Array}  raw_reply                  reply gotten from zmq socket
 * @param {Object} options 
 * @param {Object} options.simply_short_reply If reply has only one item return only the first item. 
 * @returns {Array} reply message with protocol info stripped out
 */
Message.prototype.parseReply = function(raw_reply, options){
  //configure options
  options = options || {};
  options.simply_short_reply = options.simply_short_reply || true;
  
  //parse reply
  var ret = _.map(raw_reply, msgbuf => msgbuf.toString());
  this.reply = {};
  this.reply.protocol = ret.shift();
  this.reply.service = ret.shift();  
  this.reply.message = ret;
  
  if(options.simply_short_reply && this.reply.message.length === 1) {
    this.reply.message = ret[0];
  } 
  
  return this.reply.message;
};
Message.prototype.parseResponse = Message.prototype.parseReply;
Message.prototype.getReply = function(){
  return this.reply.message;
};

module.exports = Message;