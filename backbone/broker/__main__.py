from broker import MDPBroker
import zmq
from zmq.eventloop.ioloop import IOLoop
if __name__ == '__main__':
    import baker
    
    @baker.command(default=True)
    def start(host="127.0.0.1", port="5555", silent=False, verbose=False):
        endpoint = "tcp://"+host+":"+port
        context = zmq.Context()
        broker = MDPBroker(context, endpoint, silent=silent, verbose=verbose)
        IOLoop.instance().start()
        broker.shutdown()
        
    baker.run()