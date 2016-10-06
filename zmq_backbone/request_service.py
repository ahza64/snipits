# -*- coding: utf-8 -*-

__author__ = 'Gabriel Littman'
__email__ = 'gabe@dispatchr.co'

import zmq
import baker
from client import mdp_request

@baker.command(default=True)
def request_service(name, host="127.0.0.1", port="5555", socket=None, *args):
    if not socket: 
        print name, host, port, args
        context = zmq.Context()
        socket = context.socket(zmq.REQ)
        socket.setsockopt(zmq.LINGER, 0)
        socket.connect("tcp://"+host+":"+port)
    res = mdp_request(socket, name, args, 2.0)
    print "RAW RESPONSE", res
    if res:
        assert(name == res[0])
        if len(res) > 1:
            res = res[1]
        # print "Reply:", res
    else:
        print 'Timeout!'
        res = None
        
    socket.close()
    return res



if __name__ == '__main__':
    baker.run()

