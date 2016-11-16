# -*- coding: utf-8 -*-

__author__ = 'Gabriel Littman'
__email__ = 'gabe@dispatchr.co'

import sh
from service import Service


class CmdService(Service):

    HB_INTERVAL = 1000
    HB_LIVENESS = 3

    count = 0
    cmd = None
    options = ""
    def __init__(self, service, cmd, host='127.0.0.1', port='5555'):
        super(CmdService, self).__init__(service, host, port)
        self.cmd = cmd[0]
        self.options = " ".join(list(cmd[1:]))
        
    def on_request(self, msg):
        try:
            opts = " ".join([self.options]+msg).strip()
            cmd = sh.Command(self.cmd)
            if opts == '':
                msg = cmd()
            else:
                opts = opts.split(' ')
                msg = cmd(opts)

            self.reply(str(msg))

        except Exception as e:
            print "Caught Exception", type(e), e
            self.reply("Exception")
        except TypeError as e:
            print "Caught Error", str(e)
            self.reply("ERROR")
        
        return

