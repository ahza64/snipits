# Backbone Service

A Backbone service is a message service that can send and recieve messages via the Dispatchr Backbone. Implemented in ZMQ.

##Javascript

```
var BackboneService = require('dsp_backbone/service');

function on_request(message, reply){
	console.log("MESSAGE", message);
	reply(['test-test', 'reply']);
});

var backbone = new BackboneService('test', on_request);
backbone.connect();

```

##Python

```
from service import Service


def on_request(message, reply):
	print message
	reply(['test', 'reply'])

backbone = Service(service, on_request)
backbone.start()

```

##Query Service
```
//command line requwest
$ node backbone/client request test 'message to test'

//server log
Create Stream
Starting Service: tcp://127.0.0.1:5555 test
Request:  ['', 'MDPW01', '\x02', '\x00\x80\x00A\xce', '', 'message to test']
Reply:    ['', 'MDPW01', '\x03', '\x00\x80\x00A\xce', '', 'test', 'reply']

//reply
[ 'test-test', 'reply' ]

```
