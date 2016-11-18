"use strict";
/**
 * @fileoverview MajorDomo Client Protocol this helper class serializes client messages and replys
 *
 */

var _ = require("underscore");
const PROTOCOL_VERSION = "MDPC01"; //Major Domo Protocol

/**
 * @class BackboneClientMessage
 * @param {String} service Name of the service
 * @param {String|Array} message message to be serialized
 */
class BackboneClientMessage {
  constructor(service, message){
    this.protocol = PROTOCOL_VERSION;
    this.service = service;
    this.message = message;
  }

  /**
   * @function serialize
   * @memberof BackboneClientMessage
   * @instance
   * @description   serializes the message to be sent to the Major Domo Broker
   * @returns {Array} message array to be sent
   */
  serialize() {
    var raw_message = this.message;
    if(!Array.isArray(raw_message)) {
      raw_message = [raw_message];
    }
    raw_message = [this.protocol, this.service].concat(raw_message);
    return raw_message;
  }

  /**
   * @function parseReply 
   * @description Parses reply to this message
   * @memberof BackboneClientMessage
   * @instance
   * @param {Array}  raw_reply                  reply gotten from zmq socket
   * @param {Object} options 
   * @param {Object} options.simply_short_reply If reply has only one item return only the first item. 
   * @returns {Array} reply message with protocol info stripped out
   */
  parseReply(raw_reply, options){
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
  }
  /**
   * @function parseResponse 
   * @description alias to parseReply
   * @memberof BackboneClientMessage
   * @instance  
   */
  parseResponse(raw_reply, options){
    return this.parseReply(raw_reply, options);
  } 

  /**
   * @function getReply 
   * @description get the reply message 
   * @memberof BackboneClientMessage
   * @instance  
   * @returns {Array|String} the reply sent to this message 
   */
  getReply(){
    return this.reply.message;
  }
}
module.exports = BackboneClientMessage;