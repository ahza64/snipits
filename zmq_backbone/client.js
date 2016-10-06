// request.js
var zmq = require('zmq');
var sock = zmq.socket('req');
var _ = require("underscore");
sock.connect('tcp://127.0.0.1:5555');
console.log('Producer bound to port 5555');
const PROTO_VERSION = "MDPC01"; 

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
    if(!Array.isArray(msg)) {
      msg = [msg];
    }
    var to_send = [PROTO_VERSION, service];
    to_send = to_send.concat(msg);
    socket.send(to_send);

    sock.on('message', function(prot_ver, service) {
      var ret = _.map(arguments, msgbuf => msgbuf.toString());
      console.log('received a message', prot_ver.toString(), service.toString(), ret);
      
      // ret.pop(0); // remove service from reply
      cb(ret);
    });
}

setInterval(function(){
  console.log('sending work');
  mdp_request(sock, "echo", "from node", 20, function(reply) {
    console.log("Got reply", reply);
  });
}, 1000);