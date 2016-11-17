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
$ python broker/broker.py start  --help
Usage: broker/broker.py start [<host>] [<port>]


Options:

   --host [default: 127.0.0.1]
   --port [default: 5555]
```

example
```
$ python broker/broker.py start --host 127.0.0.1 --port 5555
```