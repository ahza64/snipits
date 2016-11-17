# -*- coding: utf-8 -*-

"""Module containing client functionality for the MDP implementation.

For the MDP specification see: http://rfc.zeromq.org/spec:7
https://github.com/guidog/pyzmq-mdp
"""

__license__ = """
    This file is part of MDP.

    MDP is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    MDP is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with MDP.  If not, see <http://www.gnu.org/licenses/>.
"""
__author__ = 'Guido Goldstein'
__email__ = 'gst-py@a-nugget.de'


import zmq
from zmq.eventloop.zmqstream import ZMQStream
from zmq.eventloop.ioloop import IOLoop, DelayedCallback

###

PROTO_VERSION = b'MDPC01'

###

class InvalidStateError(RuntimeError):
    """Exception raised when the requested action is not available due to socket state.
    """
    pass
#

class RequestTimeout(UserWarning):
    """Exception raised when the request timed out.
    """
    pass
#
###

class BackboneClient(object):

    """Class for the MDP client side.

    Thin asynchronous encapsulation of a zmq.REQ socket.
    Provides a :func:`request` method with optional timeout.

    Objects of this class are ment to be integrated into the
    asynchronous IOLoop of pyzmq.

    :param context:  the ZeroMQ context to create the socket in.
    :type context:   zmq.Context
    :param endpoint: the enpoint to connect to.
    :type endpoint:  str
    :param service:  the service the client should use
    :type service:   str
    """

    _proto_version = b'MDPC01'

    def __init__(self, host='127.0.0.1', port='5555'):
        """Initialize the BackboneClient.
        """
        context = zmq.Context()
        self.socket = context.socket(zmq.REQ)
        ioloop = IOLoop.instance()
        self.host = host
        self.port = port
        self.endpoint = "tcp://"+host+":"+port
        self.stream = ZMQStream(self.socket, ioloop)
        self.stream.on_recv(self._on_message)
        self.can_send = True
        self._proto_prefix = [ PROTO_VERSION ]
        self._tmo = None
        self.timed_out = False
        self.socket.connect(self.endpoint)
        return

    def flush(self):
        self.stream.flush();

    def shutdown(self):
        """Method to deactivate the client connection completely.

        Will delete the stream and the underlying socket.

        .. warning:: The instance MUST not be used after :func:`shutdown` has been called.

        :rtype: None
        """
        if not self.stream:
            return
        self.stream.socket.setsockopt(zmq.LINGER, 0)
        self.stream.socket.close()
        self.stream.close()
        self.stream = None
        return

    def send(self, service, msg, on_message, timeout=None):
        """Send the given message.

        :param msg:     message parts to send.
        :type msg:      list of str
        :param timeout: time to wait in milliseconds.
        :type timeout:  int
        
        :rtype None:
        """
        if not self.can_send:
            raise InvalidStateError()
        if type(msg) in (bytes, unicode):
            msg = [msg]
        # prepare full message
        to_send = self._proto_prefix[:]
        to_send.append(service)
        to_send.extend(msg)
        
        self.on_message = on_message  
        self.stream.send_multipart(to_send)
        self.can_send = False
        if timeout:
            self._start_timeout(timeout)
        return

    def _on_timeout(self):
        """Helper called after timeout.
        """
        self.timed_out = True
        self._tmo = None
        self.on_timeout()
        return

    def _start_timeout(self, timeout):
        """Helper for starting the timeout.

        :param timeout:  the time to wait in milliseconds.
        :type timeout:   int
        """
        self._tmo = DelayedCallback(self._on_timeout, timeout)
        self._tmo.start()
        return

    def _on_message(self, msg):
        """Helper method called on message receive.

        :param msg:   list of message parts.
        :type msg:    list of str
        """

        if self._tmo:
            # disable timout
            self._tmo.stop()
            self._tmo = None
        # setting state before invoking on_message, so we can request from there
        self.can_send = True
        
        service = msg.pop(0)
        protocol = msg.pop(0)

        if len(msg) == 1:
            self.on_message(msg[0])
        else: 
            self.on_message(msg)


    def on_message(self, msg):
        """Public method called when a message arrived.

        .. note:: Does nothing. Should be overloaded!
        """
        pass

    def on_timeout(self):
        """Public method called when a timeout occured.

        .. note:: Does nothing. Should be overloaded!
        """
        pass
#
###

from zmq import select

def mdp_request(socket, service, msg, timeout=None):
    """Synchronous MDP request.

    This function sends a request to the given service and
    waits for a reply.

    If timeout is set and no reply received in the given time
    the function will return `None`.

    :param socket:    zmq REQ socket to use.
    :type socket:     zmq.Socket
    :param service:   service id to send the msg to.
    :type service:    str
    :param msg:       list of message parts to send.
    :type msg:        list of str
    :param timeout:   time to wait for answer in seconds.
    :type timeout:    float

    :rtype list of str:
    """
    if timeout:
        timeout = float(timeout)
    if not timeout or timeout < 0.0:
        timeout = None
    if type(msg) in (bytes, unicode):
        msg = [msg]
    to_send = [PROTO_VERSION, service]
    to_send.extend(msg)
    socket.send_multipart(to_send)
    ret = "------TIMEOUT------"
    rlist, _, _ = select([socket], [], [], timeout)
    if rlist and rlist[0] == socket:
        ret = socket.recv_multipart()
        ret.pop(0) # remove service from reply
    return ret


def request_raw(name, host="127.0.0.1", port="5555", timeout=None, *args, **opts):
    args = list(args)
    for key in opts:
        args.append('--'+key)
        args.append(str(opts[key]))
    

    # print name, host, port, args
    context = zmq.Context()
    socket = context.socket(zmq.REQ)
    socket.setsockopt(zmq.LINGER, 0)
    socket.connect("tcp://"+host+":"+port)
    res = mdp_request(socket, name, args, timeout)
    # print "RAW RESPONSE", res
    if res == "------TIMEOUT------":
        print 'Timeout!'
        res = None        
    else:
        assert(name == res[0])
        if len(res) > 1:
            res = res[1]
        # print "Reply:", res
        
    socket.close()
    return res

def request(name, host="127.0.0.1", port="5555", timeout=None, *args, **opts):
    msg = list(args)
    for key in opts:
        msg.append('--'+key)
        msg.append(str(opts[key]))
    
    client = None
    res = [None] 
    def on_message(message):
        res[0] = message
        IOLoop.instance().stop()
        
        
    client = BackboneClient(host, port)
    client.send(name, msg, on_message)

    IOLoop.instance().start()
    return res[0]


if __name__ == '__main__':
    import baker
    baker.command(request)
    baker.run()
