import zmq
from zmq.eventloop.zmqstream import ZMQStream
from zmq import select
from zmq.eventloop.ioloop import IOLoop
from onoff import OnOffMixin


main_stream = None

class MessageContext(object):
    def __init__(self, message):
        self.original_message = message
        self.message = message
        self.done = False


class ZMQStack(OnOffMixin):
    
    def __init__(self):
        self.handler_stack = []
        
    
    def start(self, endpoint="tcp://127.0.0.1:5555"):
        context = zmq.Context()
        socket = context.socket(zmq.ROUTER)
        socket.bind(endpoint)
        global main_stream
        self.main_stream = ZMQStream(socket)
        self.main_stream.on_recv(self.on_message)        
        IOLoop.instance().start()
        
    def on_message(self, message):
        if not isinstance(message, MessageContext):
            message = MessageContext(message)
        for handler in self.handler_stack:
            if not message.done:
                if self._passes_filter(handler, message):
                    func = handler['handler'] 
                    if isinstance(func, ZMQStack):
                        func.on_message(message)
                    elif callable(func): 
                        func(message)
                    else:
                        raise Error("Unknown handler type", func)

                        
    def _passes_filter(self, handler, message):
        filter = handler.get('options', {}).get('filter')
        if filter:
            for key in filter.keys():
                if hasattr(message, key) and getattr(message, key) != filter[key]:
                    return False
                
        return True
        
                    
    def use(self, *args, **opts):
        """
            This is a decorator that will add the decorated function to the stack
        """
        print "USE", args, opts
        def real_decorator(handler):
            self.handler_stack.append(dict(handler= handler, options=opts))
        
        if len(args) == 1:
            if callable(args[0]) or isinstance(args[0], ZMQStack):
                return real_decorator(args[0])
        
        return real_decorator
    
    def send_message(self, message):
        # print message.sendable()
        self.main_stream.send_multipart(message.sendable())