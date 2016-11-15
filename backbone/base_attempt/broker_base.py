import zmq
from zmq.eventloop.zmqstream import ZMQStream
from zmq.eventloop.ioloop import PeriodicCallback

from util import split_address

HB_INTERVAL = 1000  #: heartbeat in milliseconds
HB_LIVENESS = 5    #: heartbeats to miss before connection counts as dead



class Endpoint(object):

    def __init__(self, endpoint, port=None, recv_cb):
        socket = context.socket(zmq.ROUTER)
        if(port):
            endpoint += endpoint+":"+port
        socket.bind(endpoint)
        self.stream = ZMQStream(socket)
        self.stream.on_recv(recv_cb)


class HeartBeatManager():
    def __init__(self):
        self.hb_check_timer = PeriodicCallback(self.on_timer, HB_INTERVAL)
        self.hb_check_timer.start()
    
    def on_timer(self):
        """Method called on timer expiry.

        Checks which workers are dead and unregisters them.

        :rtype: None
        """
        for wrep in self._workers.values():
            if not wrep.is_alive():
                self.unregister_worker(wrep.id)
        return

class WorkerHandler(object):
    
        self._worker_cmds = { b'\x01': self.on_ready,
                              b'\x03': self.on_reply,
                              b'\x04': self.on_heartbeat,
                              b'\x05': self.on_disconnect,
                              }


class MDPBroker(object):

    """The MDP broker class.

    The broker routes messages from clients to appropriate workers based on the requested service.

    This base class defines the overall functionality and the API. Subclasses are
    ment to implement additional features (like logging).

    The broker uses ØMQ ROUTER sockets to deal witch clients and workers. These sockets
    are wrapped in pyzmq streams to fit well into IOLoop.

    .. note::

      The workers will *always* be served by the `main_ep` endpoint.

      In a two-endpoint setup clients will be handled via the `opt_ep`
      endpoint.

    :param context:    the context to use for socket creation.
    :type context:     zmq.Context
    :param main_ep:    the primary endpoint for workers and clients.
    :type main_ep:     str
    :param opt_ep:     is an optional 2nd endpoint.
    :type opt_ep:      str
    """

    CLIENT_PROTO = b'MDPC01'  #: Client protocol identifier
    WORKER_PROTO = b'MDPW01'  #: Worker protocol identifier


    def __init__(self, context, main_ep, opt_ep=None, broadcast_ep=None):
        """Init MDPBroker instance.
        """            
        self.main_stream = Endpoint(main_ep, recv_cb=self.on_message);
        
        if opt_ep:
            self.client_stream = Endpoint(opt_ep, recv_cb=self.on_message);
        else:
            self.client_stream = self.main_stream
            
        self._workers = {}
        # services contain the service queue and the request queue
        self._services = ServiceManager();

        return

    def register_worker(self, worker_id, service_name):
        """Register the worker id and add it to the given service.

        Does nothing if worker is already known.

        :param wid:    the worker id.
        :type wid:     str
        :param service:    the service name.
        :type service:     str

        :rtype: None
        """
        
        self._services.register_worker(worker_id, service_name, self.main_stream)
        return

    def unregister_worker(self, worker_id):
        """Unregister the worker with the given id.

        If the worker id is not registered, nothing happens.

        Will stop all timers for the worker.

        :param wid:    the worker id.
        :type wid:     str

        :rtype: None
        """
        self._services.unregister_worker(worker_id)
        
        

    def disconnect(self, wid):
        """Send disconnect command and unregister worker.

        If the worker id is not registered, nothing happens.

        :param wid:    the worker id.
        :type wid:     str

        :rtype: None
        """
        try:
            wrep = self._workers[wid]
        except KeyError:
            # not registered, ignore
            return
        to_send = [ wid, self.WORKER_PROTO, b'\x05' ]
        self.main_stream.send_multipart(to_send)
        self.unregister_worker(wid)
        return

    def client_response(self, rp, service, msg):
        """Package and send reply to client.

        :param rp:       return address stack
        :type rp:        list of str
        :param service:  name of service
        :type service:   str
        :param msg:      message parts
        :type msg:       list of str

        :rtype: None
        """
        to_send = rp[:]
        to_send.extend([b'', self.CLIENT_PROTO, service])
        to_send.extend(msg)
        self.client_stream.send_multipart(to_send)
        return

    def shutdown(self):
        """Shutdown broker.

        Will unregister all workers, stop all timers and ignore all further
        messages.

        .. warning:: The instance MUST not be used after :func:`shutdown` has been called.

        :rtype: None
        """
        if self.client_stream == self.main_stream:
            self.client_stream = None
        self.main_stream.on_recv(None)
        self.main_stream.socket.setsockopt(zmq.LINGER, 0)
        self.main_stream.socket.close()
        self.main_stream.close()
        self.main_stream = None
        if self.client_stream:
            self.client_stream.on_recv(None)
            self.client_stream.socket.setsockopt(zmq.LINGER, 0)
            self.client_stream.socket.close()
            self.client_stream.close()
            self.client_stream = None
        self._workers = {}
        self._services = {}
        return


    def on_ready(self, rp, msg):
        """Process worker READY command.

        Registers the worker for a service.

        :param rp:  return address stack
        :type rp:   list of str
        :param msg: message parts
        :type msg:  list of str

        :rtype: None
        """
        ret_id = rp[0]
        self.register_worker(ret_id, msg[0])
        return

    def on_reply(self, rp, msg):
        """Process worker REPLY command.

        Route the `msg` to the client given by the address(es) in front of `msg`.

        :param rp:  return address stack
        :type rp:   list of str
        :param msg: message parts
        :type msg:  list of str

        :rtype: None
        """
        print "REPLY", rp, msg)
        ret_id = rp[0]
        wrep = self._workers.get(ret_id)
        if not wrep:
            # worker not found, ignore message
            return
        service = wrep.service
        # make worker available again
        try:
            wq, wr = self._services[service]
            cp, msg = split_address(msg)
            self.client_response(cp, service, msg)
            wq.put(wrep.id)
            if wr:
                proto, rp, msg = wr.pop(0)
                self.on_client(proto, rp, msg)
        except KeyError:
            # unknown service
            self.disconnect(ret_id)
        return

    def on_heartbeat(self, rp, msg):
        """Process worker HEARTBEAT command.

        :param rp:  return address stack
        :type rp:   list of str
        :param msg: message parts
        :type msg:  list of str

        :rtype: None
        """
        ret_id = rp[0]
        try:
            worker = self._workers[ret_id]
            if worker.is_alive():
                worker.on_heartbeat()
        except KeyError:
            # ignore HB for unknown worker
            pass
        return

    def on_disconnect(self, rp, msg):
        """Process worker DISCONNECT command.

        Unregisters the worker who sent this message.

        :param rp:  return address stack
        :type rp:   list of str
        :param msg: message parts
        :type msg:  list of str

        :rtype: None
        """
        wid = rp[0]
        self.unregister_worker(wid)
        return

    def on_mmi(self, rp, service, msg):
        """Process MMI request.

        For now only mmi.service is handled.

        :param rp:      return address stack
        :type rp:       list of str
        :param service: the protocol id sent
        :type service:  str
        :param msg:     message parts
        :type msg:      list of str

        :rtype: None
        """
        if service == b'mmi.service':
            s = msg[0]
            ret = b'404'
            for wr in self._workers.values():
                if s == wr.service:
                    ret = b'200'
                    break
            self.client_response(rp, service, [ret])
        else:
            self.client_response(rp, service, [b'501'])
        return

    def on_client(self, proto, rp, msg):
        """Method called on client message.

        Frame 0 of msg is the requested service.
        The remaining frames are the request to forward to the worker.

        .. note::

           If the service is unknown to the broker the message is
           ignored.

        .. note::

           If currently no worker is available for a known service,
           the message is queued for later delivery.

        If a worker is available for the requested service, the
        message is repackaged and sent to the worker. The worker in
        question is removed from the pool of available workers.

        If the service name starts with `mmi.`, the message is passed to
        the internal MMI_ handler.

        .. _MMI: http://rfc.zeromq.org/spec:8

        :param proto: the protocol id sent
        :type proto:  str
        :param rp:    return address stack
        :type rp:     list of str
        :param msg:   message parts
        :type msg:    list of str

        :rtype: None
        """
        service = msg.pop(0)
        if service.startswith(b'mmi.'):
            self.on_mmi(rp, service, msg)
            return
        try:
            wq, wr = self._services[service]
            wid = wq.get()
            if not wid:
                # no worker ready
                # queue message
                msg.insert(0, service)
                wr.append((proto, rp, msg))
                return
            wrep = self._workers[wid]
            to_send = [ wrep.id, b'', self.WORKER_PROTO, b'\x02']
            to_send.extend(rp)
            to_send.append(b'')
            to_send.extend(msg)
            self.main_stream.send_multipart(to_send)
        except KeyError:
            # unknwon service
            # ignore request
            print 'broker has no service "%s"' % service
        return

    def on_worker(self, proto, rp, msg):
        """Method called on worker message.

        Frame 0 of msg is the command id.
        The remaining frames depend on the command.

        This method determines the command sent by the worker and
        calls the appropriate method. If the command is unknown the
        message is ignored and a DISCONNECT is sent.

        :param proto: the protocol id sent
        :type proto:  str
        :param rp:  return address stack
        :type rp:   list of str
        :param msg: message parts
        :type msg:  list of str

        :rtype: None
        """
        cmd = msg.pop(0)
        if cmd in self._worker_cmds:
            fnc = self._worker_cmds[cmd]
            fnc(rp, msg)
        else:
            # ignore unknown command
            # DISCONNECT worker
            self.disconnect(rp[0])
        return
        
    def send_broadcast(self, protocol, rp, msg):
        """Method called on worker message.

        Frame 0 of msg is the command id.
        The remaining frames depend on the command.

        This method determines the command sent by the worker and
        calls the appropriate method. If the command is unknown the
        message is ignored and a DISCONNECT is sent.

        :param proto: the protocol id sent
        :type proto:  str
        :param rp:  return address stack
        :type rp:   list of str
        :param msg: message parts
        :type msg:  list of str

        :rtype: None
        """
        event = msg.pop(0)
        self.broadcast_stream.send_multipart(msg)
        return

    def on_message(self, msg):
        """Processes given message.

        Decides what kind of message it is -- client or worker -- and
        calls the appropriate method. If unknown, the message is
        ignored.

        :param msg: message parts
        :type msg:  list of str

        :rtype: None
        """
        rp, msg = split_address(msg)
        # dispatch on first frame after path
        protocol = msg.pop(0)
        if protocol.startswith(b'MDPW'):
            self.on_worker(protocol, rp, msg)
        elif protocol.startswith(b'MDPC'):
            self.on_client(protocol, rp, msg)
        else:
            print 'Broker unknown Protocol: "%s"' % t
        return
        


#
###

### Local Variables:
### buffer-file-coding-system: utf-8
### mode: python
### End:
