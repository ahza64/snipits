# Email 

## Templates
Email Templates are stored in the database for ile system.  The should use [Mustache.js](https://github.com/janl/mustache.js/) template format. 

#### File Template
```json
templates/test.json
{
    "subject": "Test Email",
    "body": {
        "text": "Hi,\n\nThis is an email template.\n\nYou're value is {{value}}\n\nThanks,\n\n- Template Test",
        "html": "<html>This is the html <b>version</b><br>template value: <i>{{value}}</i></html>"
    }    
}
```

#### Database Template
|template | subject    | body_type | body|
|test     | Test Email | text      | Hi,\n\nThis is an email template.\n\nYou're value is {{value}}\n\nThanks,\n\n- Template Test |
|test     | Test Email | html      | <html>This is the html <b>version</b><br>template value: <i>{{value}}</i></html> |


## Distribution Lists
Distribution lists a stored in the database for file system.  

#### File Distribution List

```json
distribution_lists/musketeers.json
[
    {
        "name": "Tejas",
        "email": "tejas@dispatchr.com"
    },
    {
        "name": "Xuchang",
        "email": "xuchang@dispatchr.com"
    },
    {
        "name": "Rahul",
        "email": "rahul@dispatchr.com"
    }
]
```
#### Database Distribution List
| list       | name    | email |
| musketeers | Tejas   | tejas@dispatchr.com | 
| musketeers | Xuchang | xuchang@dispatchr.com | 
| musketeers | Rahul   | rahul@dispatchr.com | 

## Create Mail
Library can create and send email.

```js
var create_mail = require('./email/create_mail);

//yield create_mail(to, from, template, values, subject, text, html, send);
yield create_mail('musketeers', gabe@dispatchr, 'test', {value: "TEMPLATE VALUE"}, undefined, undefined, undefined, true);
yield create_mail('musketeers', gabe@dispatchr, undefined, undefined, "TEXT EMAIL", "EMAIL TEXT BODY HERE", undefined, true);

```

## Start The Service
Create Mail is wrapped up in a service is wrapped up in a service that can run as a deamon

```
$ node email/service.js start --help
Usage: /Users/gabriellittman/Development/services/email/service.js start <host> <port> <options>
Required Arguments:


Options:

   --host [default 127.0.0.1]
   --port [default 5555]
   --[variable] Other options will be hardcoded in create mail for the service and override requests
```

```
//Start the service
$ node email/service.js start 

//Start the service on port 6666
$ node email/service.js start --port 6666

//Start the service that will never send
$ node email/service.js start --send false

```


## Send Request to Service
You can use the library to send a request to the service

```js
var service = require('./email/service');

service.request({
	to: 'musketeers',
	from: 'gabe@dispatchr.co',
	template: 'test',
	value: 'SERVICE REQUEST TEMPLATE VALUE'
}).then(result => {
	console.log("GOT THE RESULT", result);
})
```

If you have a connection already open to the broker you can pass in the BackboneClient
```js
var BackboneClient = require('dsp_backbone/client');
var service = require('./email/service');
var client = new BackboneClient('127.0.0.0', '5555');
service.request({
	client: client
	to: 'musketeers',
	from: 'gabe@dispatchr.co',
	template: 'test',
	value: 'SERVICE REQUEST TEMPLATE VALUE'
})
```