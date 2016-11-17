
var BackboneClient = require('./client');

function request(service, args, opts){
  console.log('request', service, args, opts);
  var host = opts.host;
  var port = opts.port;
  var timeout = opts.timeout;
  delete opts.host;
  delete opts.port;
  delete opts.timeout;
  
  var full_message = args || [];
  for(var key in opts) {
   if(opts.hasOwnProperty(key)) {
     var opt = '';
     if(key.length > 1) {
       opt += "--";
     } else {
       opt += "-";
     }
     opt += key; 
     full_message.push(opt);
   }
  }

  var message = full_message.join(' ');
  console.log("Message", message);
  var bbc = new BackboneClient(host, port);
  bbc.connect();
  return bbc.send(service, message, timeout).finally(() => {
   bbc.disconnect();
  });
}

function run() {
  var baker = require('dsp_shared/lib/baker');
  baker.command(request, {opts: "opts", args: "args", default: true});
  baker.run();  
}


module.exports = {request: request, run: run};
//baker module
if (require.main === module) {
  run();
}
