from cmd import *
import baker

@baker.command(default=True)
def service(name, host="127.0.0.1", port="5555", *args, **opts):
    args = list(args)
    for key in opts:
        args.append('--'+key)
        args.append(str(opts[key]))
    print name, host, port, args    
    context = zmq.Context()
    worker = CmdService(context, "tcp://"+host+":"+port, name, args)
    print 'service starting', name, args
    IOLoop.instance().start()
    # print 'worker ready to shutdown'
    # worker.shutdown()

if __name__ == '__main__':
    baker.run()
