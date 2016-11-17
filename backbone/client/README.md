#Backbone Client

##Javascript

```
var BackboneClient = require('dsp_backbone/client');

var bbc = new BackboneClient();
bbc.connect();
bbc.send('ls-service', '/tmp').then(reply => {
	console.log(reply)
})

```

##Python
Objects of this class are ment to be integrated into the asynchronous IOLoop of pyzmq.
```
from client import Service
def on_message(message):
	print message      

bbc = BackboneClient(name, host, port)
bbc.send('ls-service', '/tmp', on_message)
IOLoop.instance().start() #start io loop

```

##Example Output
```
//command line ls service
$ python -m backbone.service ls-service ls

//service log
Create Stream
Command Service: ls-service ['ls']
Starting Service: tcp://127.0.0.1:5555 ls-service
Request:  ['', 'MDPW01', '\x02', '\x00\x80\x00A\xda', '', '/tmp']
Reply:    ['', 'MDPW01', '\x03', '\x00\x80\x00A\xda', '', 'tempfile1\ntempfile2']

//client output
tempfile1
tempfile2

```
