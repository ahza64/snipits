/* globals describe, it, before, after */
var spawn = require('child_process').spawn;
var BackboneService = require('dsp_service');
var BackboneClient = require('dsp_client');
var assert = require("assert");
require('should');

var HOST = "127.0.0.1";
var PORT = "6666";


function startBroker(verbose) {
  var args = [];
  args.push('-u');  
  args.push('-m');  
  args.push('backbone.broker'); 
  args.push('--host', HOST); 
  args.push('--port', PORT); 
  // args.push('--silent');
  var broker = spawn('python', args);


  var last_line = "";
  return new Promise( resolve => {
    broker.stdout.on('data', (data) => {
      var str = data.toString();
      // console.log(">>>>>>>>>>>>>>>", str);
      var lines = str.split(/\s*\r?\n\s*/);
      lines[0] = last_line+lines[0];
      last_line = lines.pop();         
      for (var i=0; i<lines.length; i++) {
        if(verbose) {
          console.log(`>>>>>>>>>>>> broker stdout: ${lines[i]}`);
        }
        if(lines[i] === "Broker Started") {
          resolve(broker);
        }        
      }
    
    });

    broker.stderr.on('data', (data) => {
      console.log(`>>>>>>>>>>>> broker stderr: ${data}`);
    });     
  });
}

function stopBroker(broker) {
  broker.kill('SIGTERM');
}

describe("dispatchr backbone", () => {
  var broker;
  var client;
  var service;
  var request_message;
  var response_message;

  before(done => {
    //start broker
    // console.log(["python"].concat(full_argv).join(' '));
    startBroker(true).then(function(b){
      broker = b;
      done();
    });
  });

  after(() => {
    // broker.kill('SIGHUP');
    stopBroker(broker);
  });
  
  it("services can connect to backbone", function(done) {
    service = new BackboneService('mocha_test1', (message, reply) => {
      if(typeof(request_message) === "string") {
        message.length.should.eql(1);
        message[0].toString().should.eql(request_message);
      } else {
        for(var i = 0; i < message.length; i++) {
          message.should.eql(request_message);
          message[i].toString().should.eql(request_message[i]);
        }
      }

      reply(response_message);
    },{
      host: HOST,
      port: PORT
    });
    service._socket.on('connect', function(){
      done();
    });
    service.connect();
  });


  it("clients can connect to backbone", function(done) {
    client = new BackboneClient(HOST, PORT);
    client.connect().then(function(){
      done();
    });    
  });
  
  it("can send a simple round trip", function(done){
    request_message  = "ROUND TRIP 1 - PING";
    response_message = "ROUND TRIP 1 - PONG";
    client.send('mocha_test1', request_message).then(reply => {
      reply.should.be.eql(response_message);
      done();
    });
  });
  
  it("can survive service failure", function(done){
    this.timeout(100000);
    service.shutdown();
    client.send('mocha_test1', request_message, 1000).then(reply => {
      assert(false, "Should not send reply on timeout.");
    }).catch(error => {
      console.log("GOT ERROR", error);
      error.message.should.eql("Request Timeout");
      done();
    });
    
  });


  //TODO what if service is connected but never sends reply
}); 
