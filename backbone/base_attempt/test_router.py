import baker
from zmq_stack import ZMQStack
from util import split_address
from functools import partial
from zmq.eventloop.ioloop import PeriodicCallback

HB_INTERVAL = 1000  #: heartbeat in milliseconds
HB_LIVENESS = 5    #: heartbeats to miss before connection counts as dead

CLIENT_PROTO = b'MDPC01'  #: Client protocol identifier
WORKER_PROTO = b'MDPW01'  #: Worker protocol identifier

class Message(object):
    def __init__(self, to, protocol, message):
        if type(to) in (bytes, unicode):
            to = [to]
        self.to = to
        self.protocol = protocol
        self.message = message
        
    def sendable(self):
        message = []
        message.extend(self.to)
        message.append('')
        message.append(self.protocol)
        message.extend(self.message)
        return message

class HeartBeatMessage(Message):
    def __init__(self, to):
        super(HeartBeatMessage, self).__init__(to, WORKER_PROTO, [b'\x04'])
        
        

class ServiceProtocol(ZMQStack):
    def __init__(self):
        super(ServiceProtocol, self).__init__()
        
        @self.use
        def parse_worker_command(context):
            context.service = context.message.pop(0)
    

class WorkerProtocol(ZMQStack):

    def __init__(self):
        super(WorkerProtocol, self).__init__()
        
        @self.use
        def parse_worker_command(context):
            context.cmd_code = context.message.pop(0)
            worker_cmds = { 
                b'\x01': "ready",
                b'\x02': "request",
                b'\x03': "reply",
                b'\x04': "heartbeat",
                b'\x05': "disconnect"
            }
            context.command = worker_cmds[context.cmd_code]
            # print context.original_message, context.message

        @self.use
        def set_worker_id(context):
            context.worker_id = context.reply_stack[0]

        @self.use(filter={"command": "heartbeat"})
        def handle_heartbeat(context):
            print "Got Heartbeat", context.reply_stack
            self.trigger('heartbeat', context)
            context.done = True
            
        self.use(ServiceProtocol())


        @self.use(filter={"command": "ready"})
        def handle_worker_ready(context):

            self.trigger('ready', context)
        
        

class BrokerProtocol(ZMQStack):
    
    
    def __init__(self):
        super(BrokerProtocol, self).__init__()
        @self.use
        def handle_reply_stack(context):
            rp, msg = split_address(context.message)
            context.message = msg
            context.reply_stack = rp
            # print "Reply Stack",context.reply_stack, context.message
    
        @self.use
        def parse_protocol(context):
            context.protocol = context.message.pop(0)
            # print "Protocol",context.protocol, context.message
        
        @self.use(filter=dict(protocol=CLIENT_PROTO))
        def handle_worker(context):
            print "Handle Client", context.message
        
        
        worker = WorkerProtocol()
        self.use(worker, filter=dict(protocol=WORKER_PROTO))
        
        worker.on('ready', partial(self.trigger, 'register_worker'))
        worker.on('heartbeat', partial(self.trigger, 'worker_alive'))
        
        
class Broker(object):
    def __init__(self):
        self.services = ServiceManager()
        self.endpoint="tcp://127.0.0.1:5555"        
        self.protocol = BrokerProtocol()


        self.protocol.on('register_worker', self.register_worker)
        self.protocol.on('worker_alive', self.worker_alive)
        self.hb_check_timer = PeriodicCallback(self.check_heartbeat, HB_INTERVAL)
        self.hb_check_timer.start()
        
        
    def register_worker(self, context):
        print "Got Ready Message", context.reply_stack, context.message, [context.worker_id]
        self.services.register_worker(context.worker_id, context.service, self.send_message)

    def worker_alive(self, context):
        self.services.worker_alive(context.worker_id)

    

    def check_heartbeat(self):
        self.services.check_heartbeats();

        
    def start(self):       
        self.protocol.start(self.endpoint)

    def send_message(self, message):
        self.protocol.send_message(message)

class Service(object):
    def __init__(self, name):
        self.name = name;
        self.workers = {}
        self.worker_queue = ServiceQueue()
        
    def get_worker(self, worker_id):
        return self.workers.get(worker_id) 
        
    def register_worker(self, worker_id, worker):
        self.workers[worker_id] = worker
        self.worker_queue.put(worker_id)
        
    def unregister_worker(self, worker_id):
        worker = self.workers[worker_id].shutdown();
        self.worker_queue.remove(worker_id)
        del self.workers[worker_id]
        
        
class ServiceManager(object):
    def __init__(self):
        self._services = {}
        self._worker_services = {}

    def register_worker(self, worker_id, service_name, send_message):
        service = self.get_service(worker_id)
        if not service.get_worker(worker_id):
            worker = Worker(WORKER_PROTO, worker_id, service_name, send_message)
            service.register_worker(worker_id, worker)
            self._worker_services[worker_id] = service
       
    def unregister_worker(self, worker_id):
        service = self.get_service(worker_id=worker_id) 
        if service:
            service.unregister_worker(worker_id)
            del self._worker_services[worker_id]
        return
        
        
        
    def get_service(self, service_name=None, worker_id=None):
        if service_name: 
            if service_name not in self._services:
                self._services[service_name] = Service(service_name)
            service = self._services[service_name]
            return service
        elif worker_id:
            return self._worker_services.get(worker_id)
        
        return None
    
    def check_heartbeats(self):
        service = None
        for service in self._services.values():
            for worker in service.workers.values():
                if not worker.is_alive():
                    print "Worker Dead", [worker.id]
                    self.unregister_worker(worker.id)
    
    def worker_alive(self, worker_id):
        service = self._worker_services[worker_id]
        worker = service.get_worker(worker_id)
        worker.on_heartbeat()
        
        
class Worker(object):

    """Helper class to represent a worker in the broker.

    Instances of this class are used to track the state of the attached worker
    and carry the timers for incomming and outgoing heartbeats.

    :param proto:    the worker protocol id.
    :type wid:       str
    :param wid:      the worker id.
    :type wid:       str
    :param service:  service this worker serves
    :type service:   str
    :param send_message:   send_message function
    :type stream:    ZMQStream
    """

    def __init__(self, proto, wid, service_name, send_message):
        self.proto = proto
        self.id = wid
        self.service = service_name
        self.curr_liveness = HB_LIVENESS
        self.send_message = send_message
        self.last_hb = 0
        self.hb_out_timer = PeriodicCallback(self.send_hb, HB_INTERVAL)
        self.hb_out_timer.start()
        return

    def send_hb(self):
        """Called on every HB_INTERVAL.

        Decrements the current liveness by one.

        Sends heartbeat to worker.
        """
        self.curr_liveness -= 1
        print "sending heartbeat", self.curr_liveness
        self.send_message(HeartBeatMessage(self.id))
        return

    def on_heartbeat(self):
        """Called when a heartbeat message from the worker was received.

        Sets current liveness to HB_LIVENESS.
        """
        self.curr_liveness = HB_LIVENESS
        return

    def is_alive(self):
        """Returns True when the worker is considered alive.
        """
        print "worker life", [self.id], self.curr_liveness
        return self.curr_liveness > 0

    def shutdown(self):
        """Cleanup worker.

        Stops timer.
        """
        self.hb_out_timer.stop()
        self.hb_out_timer = None
        self.stream = None
        return
#

class ServiceQueue(object):

    """Class defining the Queue interface for workers for a service.

    The methods on this class are the only ones used by the broker.
    """

    def __init__(self):
        """Initialize queue instance.
        """
        self.q = []
        return

    def __contains__(self, wid):
        """Check if given worker id is already in queue.

        :param wid:    the workers id
        :type wid:     str
        :rtype:        bool
        """
        return wid in self.q

    def __len__(self):
        return len(self.q)

    def remove(self, wid):
        try:
            self.q.remove(wid)
        except ValueError:
            pass
        return

    def put(self, wid, *args, **kwargs):
        if wid not in self.q:
            self.q.append(wid)
        return

    def get(self):
        if not self.q:
            return None
        return self.q.pop(0)
        


@baker.command(default=True)
def setup_router():
    broker = Broker()
    broker.start();
        
if __name__ == '__main__':
    baker.run()
