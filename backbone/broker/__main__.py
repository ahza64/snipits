from broker import MDPBroker
import zmq
from zmq.eventloop.ioloop import IOLoop
if __name__ == '__main__':
    import baker
    
    @baker.command(default=True)
    def start(host="127.0.0.1", port="5555"):
        endpoint = "tcp://"+host+":"+port
        context = zmq.Context()
        broker = MDPBroker(context, endpoint)
        IOLoop.instance().start()
        broker.shutdown()
        
    baker.run()