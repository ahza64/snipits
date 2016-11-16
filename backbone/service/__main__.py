from cmd import *
import baker

@baker.command(default=True)
def service(name, host="127.0.0.1", port="5555", *args, **opts):
    args = list(args)
    for key in opts:
        args.append('--'+key)
        args.append(str(opts[key]))
    worker = CmdService(name, args, host, port)
    print 'Command Service:', name, args
    worker.start()    
    


if __name__ == '__main__':
    baker.run()
