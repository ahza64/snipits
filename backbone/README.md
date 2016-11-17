#Dispatchr Backbone

Dispatchr Backbone message passing utilities

##Installation
### on Mac OSX
- brew install zeromq
- brew install pkgconfig
- easy_install pyzmq
- easy_install baker
- npm install


##Broker
Broker is written in Python.  It is a standalone process:
```
$ python -m backbone.broker start  --help
Usage: backbone/broker/__main__.py start [<host>] [<port>]


Options:

   --host [default: 127.0.0.1]
   --port [default: 5555]
```

example
```
$ python broker/broker.py start --host 127.0.0.1 --port 5555
```

##Service
A service registers itself with the the Broker.  Service API libraries exist for Javascript and Python so that Services can be written in either.
[More Service Docs Here](backbone/service/README.md)
###Command Service
The command line service exists to allow any command to be easily turned into a service.
```
services$ python -m backbone.service cmd-service --help
Usage: /Users/gabriellittman/Development/services/backbone/service/__main__.py cmd-service <name> [<host>] [<port>] [<args>...]


Required Arguments:

  name   

Options:

   --host  
   --port  

Variable arguments:

   *args 

```

example
```
services$ python -m backbone.service ls-service ls
Create Stream
Command Service: ls-service ['ls']
Starting Service: tcp://127.0.0.1:5555 ls-service
```


##Client
A client connects to the broker and allows you make requests to Services. Client API libraries exist for Javascript and Python so that clients can be written in either.
[More Client Docs Here](client/README.md)

###Commnadl Line Request
The Command Line Request utility allows you to send easily send requests to 
```
$ python -m backbone.client request --help
Usage: /Users/gabriellittman/Development/services/backbone/client/__main__.py request <name> [<host>] [<port>] [<timeout>] [<args>...]


Required Arguments:

  name   

Options:

   --host     
   --port     
   --timeout  

Variable arguments:

   *args 

(specifying a double hyphen (--) in the argument list means all subsequent arguments are treated as bare arguments, not options)
```

example
```
$ python -m backbone.client request ls-service 
README.md	base_attempt	client		sample		util.py
__init__.py	broker		gabe_sample	service		util.pyc
__init__.pyc	broker.pyc	node_modules	test		worker.pyc

```
