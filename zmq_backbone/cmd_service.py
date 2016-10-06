# -*- coding: utf-8 -*-

__author__ = 'Gabriel Littman'
__email__ = 'gabe@dispatchr.co'

import zmq
import baker
import sh

from worker import MDPWorker
from zmq.eventloop.ioloop import IOLoop
###

class Service(MDPWorker):

    HB_INTERVAL = 1000
    HB_LIVENESS = 3

    count = 0
    cmd = None
    options = ""
    def __init__(self, context, endpoint, service, cmd):
        super(Service, self).__init__(context, endpoint, service)
        self.cmd = cmd[0]
        self.options = " ".join(list(cmd[1:]))
        
    def on_request(self, msg):
        try:
            opts = " ".join([self.options]+msg).strip()
            if opts == '':
                opts = []
            else:
                opts = opts.split(' ')
            print "REQUEST:"
            print self.service, opts            
            cmd = sh.Command(self.cmd)
            msg = cmd(opts)
            print "REPLY:"
            print msg            
            self.reply(str(msg))

        except Exception as e:
            print "Caught Exception", type(e), e
            self.reply("Exception")
        except TypeError as e:
            print "Caught Error", str(e)
            self.reply("ERROR")
        
        return
#
###


def runCommand():
    msg=msg+[str(self.count)]
    self.reply(msg)

@baker.command(default=True)
def service(name, host="127.0.0.1", port="5555", *args):
    print name, host, port, args
    context = zmq.Context()
    worker = Service(context, "tcp://"+host+":"+port, name, args)
    print 'service starting', name
    IOLoop.instance().start()
    # print 'worker ready to shutdown'
    # worker.shutdown()
    
@baker.command
def test():
    pwd = sh.Command('pwd')
    print pwd()
    print pwd([])
    

if __name__ == '__main__':
    baker.run()

### Local Variables:
### buffer-file-coding-system: utf-8
### mode: python
### End:
