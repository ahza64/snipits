#!/usr/bin/env python
import baker #sudo easy_install baker
from httplib2 import Http #sudo easy_install httplib2
from urllib import urlencode
import json, sys
list_class = list
#from config import config 
# print config
HOST = "prod" #config['host'] 
PORT = None #config['port'] 

# URL_PREFIX = ''
URL_PREFIX = '/api/v3'


def host_helper(host, port):
    if host == 'dev':
        return "dev.dispatchr.co", 80
    if host == 'prod':
        return "prod2.dispatchr.co", 8080
    if host == 'demo':
        return "demo.dispatchr.co", 80
    if host == 'test':
        return "test.dispatchr.co", 80
    if host == 'train':
        return "train.dispatchr.co", 80
    if host == 'trans':
        return "trans.dispatchr.co", 80
    if host == 'gabe':
        return "97e6a335.ngrok.io", 80

    return host, port
    
def create(resource, host=HOST, port=PORT, json_data=None, data=None, file=None, stdin=False, parse_json=False, **opts):
    if json_data:
        data = json.loads(json_data)
    elif stdin:
        data = sys.stdin.read()        
        data = json.loads(data)
    elif file:
        f = open(file)
        data = f.read()
        data = json.loads(data)
    elif not data:
        data = opts
    # print ("POST", resource, None, host, port, None, data)
    return request("POST", resource, None, host, port, None, data, parse_json=parse_json)

def update(resource, id, host=HOST, port=PORT, json_data=None, data=None, file=None, stdin=False, parse_json=False, **opts):
    if json_data:
        data = json.loads(json_data)
    elif stdin:
        data = sys.stdin.read()        
        data = json.loads(data)        
    elif file:
        f = open(file)
        data = f.read()
        data = json.loads(data)
    elif not data:
        data = opts

    return request("PUT", resource, id, host, port, None, data, parse_json=parse_json)

    

def patch(resource, id, host=HOST, port=PORT, json_data=None, file=None, stdin=False, data=None, parse_json=False, **opts):
    if json_data:
        data = json.loads(json_data)
    elif stdin:
        data = sys.stdin.read()        
        data = json.loads(data)
    elif not data:
        data = opts
        
    jsonpatch = isinstance(data, list_class)
    return request("PATCH", resource, id, host, port, data=data, jsonpatch=jsonpatch, parse_json=parse_json)


def get(resource, id, host=HOST, port=PORT, parse_json=False, **args):
    # print query_str
    query_str = None
    for arg in args:
        if query_str:
            query_str += "&"
        else:
            query_str = "?"
        query_str += "{arg}={value}".format(arg=arg, value=args[arg])
    return request("GET", resource, id, host, port, parse_json=parse_json, query_str=query_str)



def delete(resource, id, host=HOST, port=PORT):
    return request("DELETE", resource, id, host, port)

@baker.command
def list(resource, host=HOST, port=PORT, offset=None, length=None, parse_json=False, verbose=True, **args):
    query_str = None
    
    if length or offset:
        if not length: 
            length = 10
        if not offset:
            offset = 0            
        query_str = "?offset={offset}&length={length}".format(offset=offset, length=length)


    # print query_str
    for arg in args:
        if query_str:
            query_str += "&"
        else:
            query_str = "?"
        query_str += "{arg}={value}".format(arg=arg, value=args[arg])
    return request("GET", resource, None, host, port, query_str, parse_json=parse_json, verbose=verbose)


def request(method, resource, id=None, host=HOST, port=PORT, query_str=None, data=None, jsonpatch=False, parse_json=False, verbose=True):        
    host, port = host_helper(host, port)
    h = Http()
    url = "http://{host}:{port}{url_prefix}/{resource}".format(host=host, port=port, resource=resource, url_prefix=URL_PREFIX)
    if id:
        url += '/' + id
    if query_str:
        url += query_str
    if data:
        data = json.dumps(data)
    else:
        data = None

    if verbose:
        print >> sys.stderr, method, url, data
    headers = None
    if jsonpatch:
        response = h.request(url, method.upper(), data, headers={'content-type':'application/json-patch+json'})
    else:
        response = h.request(url, method.upper(), data, headers={'content-type':'application/json'})
                  
    if response[0]['status'] == '200' or response[0]['status'] == '201':
        if parse_json:
            return json.loads(response[1])
        else:
            return response[1]
    else:
        print >> sys.stderr, response
        raise Exception(response)

def resources(resource, host=HOST, port=PORT, verbose=True, **args):
    length = 1000
    offset = 0
    
    for arg in dict(args):
        if args[arg] == None:
            del args[arg]
    
    while True:
        # print resource, host, port, args
        res = list(resource, host, port, offset, length, verbose=verbose, **args)
        for r in res:
            yield r
        
        if len(res) < length:
            break;
        offset += length
    
@baker.command
def test():
    return json.dumps({'loc': {'coordinates':[10,5]}})
        

if __name__ == '__main__':
    baker.command(create)
    baker.command(update)
    baker.command(patch)
    baker.command(get)
    baker.command(delete)
    baker.command(list)    
    baker.run()
