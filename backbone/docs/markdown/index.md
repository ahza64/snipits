[Home](index.md)
------------------

### Classes

-   [BackboneClient](BackboneClient.md)
    -   [connect](BackboneClient.md#connect)
    -   [disconnect](BackboneClient.md#disconnect)
    -   [getEndpoint](BackboneClient.md#getEndpoint)
    -   [send](BackboneClient.md#send)
-   [BackboneClientMessage](BackboneClientMessage.md)
    -   [getReply](BackboneClientMessage.md#getReply)
    -   [parseReply](BackboneClientMessage.md#parseReply)
    -   [parseResponse](BackboneClientMessage.md#parseResponse)
    -   [serialize](BackboneClientMessage.md#serialize)
-   [BackboneService](BackboneService.md)
    -   [connect](BackboneService.md#connect)
-   [CmdService](CmdService.md)

Dispatchr Backbone
==================

Dispatchr Backbone message passing utilities

Installation
------------

### on Mac OSX

-   brew install zeromq
-   brew install pkgconfig
-   easy\_install pyzmq
-   easy\_install baker
-   npm install

Broker
------

Broker is written in Python. It acts as a middle man between the clients and services. It is a standalone process:

``` prettyprint
$ python -m backbone.broker start  --help
Usage: backbone/broker/__main__.py start [<host>] [<port>]


Options:

   --host [default: 127.0.0.1]
   --port [default: 5555]
```

example

``` prettyprint
$ python -m backbone.broker start --host 127.0.0.1 --port 5555
```

Service
-------

A service registers itself with the the Broker. Service API libraries exist for Javascript and Python so that Services can be written in either. [More Service Docs Here](service/README.md)

### Command Service

The command line service exists to allow any command to be easily turned into a service.

``` prettyprint
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

``` prettyprint
services$ python -m backbone.service ls-service ls
Create Stream
Command Service: ls-service ['ls']
Starting Service: tcp://127.0.0.1:5555 ls-service
```

Client
------

A client connects to the broker and allows you make requests to Services. Client API libraries exist for Javascript and Python so that clients can be written in either. [More Client Docs Here](client/README.md)

### Commnadl Line Request

The Command Line Request utility allows you to send easily send requests to services from the command line

``` prettyprint
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

#### Python Example

``` prettyprint
$ python -m backbone.client request ls-service 
README.md    base_attempt    client        sample        util.py
__init__.py    broker        gabe_sample    service        util.pyc
__init__.pyc    broker.pyc    node_modules    test        worker.pyc
```

#### Node Example

``` prettyprint
$ node backbone/client request ls-service 
README.md    base_attempt    client        sample        util.py
__init__.py    broker        gabe_sample    service        util.pyc
__init__.pyc    broker.pyc    node_modules    test        worker.pyc
```

Protocol
========

\#\#Worker Protocol `[<ADDRESS STACK>, '', <PROTOCOL ID>, <MESSAGE_TYPE_ID>, ... ]`

\#\#\#Message Types

-   x01 =&gt; Register Service
-   x02 =&gt; Service Request
-   x03 =&gt; Service Response
-   x04 =&gt; Heart Beat

#### Register Service

Worker To Service `[<WORKER ADR>, '', 'MDPW01', '\x01', 'service_name']`

#### Service Request

Broker To Worker `[<WORKER ADR>, '', 'MDPW01', '\x02', <CLIENT ADR>, '', 'request_data1, request_data2']`

#### Service Response

Worker To Broker `[<WORKER ADR>, '', 'MDPW01', '\x03', <CLIENT ADR>, '', 'response_data1', 'response_data2']`

#### Heart Beat

Wroker =&gt; Broker and Broker =&gt; Worker `[<WORKER ADR>, '', 'MDPW01', '\x04']`

Client Protocol
---------------

`[<ADDRESS STACK>, '', 'MDPC01', 'service_name', ...]`

### Request

Client To Broker `[<CLIENT ADR>, '', 'MDPC01', 'service_name', 'request_data1, request_data2']`

### Response

Broker To Cleint `[<CLIENT ADR>, '', 'MDPC01', 'service_name', 'response_data1', 'response_data2']`

Workflow
--------

| Request Flow        | Protocol | Request Type      | Protocol                                                                                     |
|---------------------|----------|-------------------|----------------------------------------------------------------------------------------------|
| Worker =&gt; Broker | Worker   | Register Service  | `[<WORKER ADR>, '', 'MDPW01', '\x01', 'service_name']`                                       |
| Wroker =&gt; Broker | Worker   | Service Heartbeat | `[<WORKER ADR>, '', 'MDPW01', '\x04']`                                                       |
| Broker =&gt; Worker | Worker   | Service Heartbeat | `[<WORKER ADR>, '', 'MDPW01', '\x04']`                                                       |
| Client =&gt; Broker | Client   | Service Request   | `[<CLIENT ADR>, '', 'MDPC01', 'service_name', 'request_data1, request_data2']`               |
| Broker =&gt; Worker | Worker   | Service Request   | `[<WORKER ADR>, '', 'MDPW01', '\x02', <CLIENT ADR>, '', 'request_data1, request_data2']`     |
| Worker =&gt; Broker | Worker   | Service Response  | `[<WORKER ADR>, '', 'MDPW01', '\x03', <CLIENT ADR>, '', 'response_data1', 'response_data2']` |
| Broker =&gt; Cleint | Client   | Service Response  | `[<CLIENT ADR>, '', 'MDPC01', 'service_name', 'response_data1', 'response_data2']`           |
||
||
||

client/client.js
----------------

This is is a generic broker client api for javascript

Source:  
-   [client/client.js](client_client.js.md), [line 1](client_client.js.md#line1)

client/mdc\_protocol.js
-----------------------

MajorDomo Client Protocol this helper class serializes client messages and replys

Source:  
-   [client/mdc\_protocol.js](client_mdc_protocol.js.md), [line 2](client_mdc_protocol.js.md#line2)

service/cmd.js
--------------

Service that takes a command line and arguments and turns it into a service

Author:  
-   &lt;gabe@dispatchr.co&gt; (Gabriel Littman)

Source:  
-   [service/cmd.js](service_cmd.js.md), [line 2](service_cmd.js.md#line2)

service/py\_cmd.js
------------------

Utilities to start a command through the python command line service implementation

Source:  
-   [service/py\_cmd.js](service_py_cmd.js.md), [line 1](service_py_cmd.js.md#line1)

service/service.js
------------------

This is is a generic broker woker api for javascript

Source:  
-   [service/service.js](service_service.js.md), [line 2](service_service.js.md#line2)

Documentation generated by [JSDoc 3.4.0](https://github.com/jsdoc3/jsdoc) on Wed Dec 07 2016 15:01:20 GMT-0800 (PST) using the Minami theme.
