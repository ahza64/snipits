/* globals describe, it */
var WorkPacket = require("../work_packet");
var test_location = require("./test_location");
var test_util = require("./util");
var xsd = require('libxml-xsd');
var path = require('path');
var process = require('process');
var _ = require('underscore');

var xsd_file_path =   path.dirname(__filename)+'/../../xsd/work-packet.xsd';
var packets = {
  simple_packet: require("./data/simple_packet.json"),
  packet1: require("./data/work_packet1.json")
};


describe("tree work packet tests", function(){
  for(var packet_name in packets) {
    if(packets.hasOwnProperty(packet_name)){
      var packet = packets[packet_name];  
      createTest(packet_name, packet);
    }
  }
}); 


function createTest(packet_name, packet) {
  it("can create location for trees: "+packet_name, function(done){
    var idx = _.indexOf(process.argv, "--email");
    var email;
    if(idx !== -1) {
      email = process.argv[idx+1];
    }
    var workPacket = new WorkPacket(email);

    for(var i = 0; i < packet.locations.length; i++) {      
      var loc_name = packet.locations[i];
      var loc = require("./data/"+loc_name+".json");      
      var treeLocation = test_location.loadLocation(loc);
      workPacket.addLocation(treeLocation);
    }
    
    workPacket.validateRequired();
    
    //TODO: Fix this ... schema check is not working (never errors)
    test_util.testResults(packet.results, "work_packet", packet_name, workPacket.packet);
    xsd.parseFile(xsd_file_path, function(err, schema){    
      (err === null).should.be.eql(true, err);
      schema.validate(workPacket.toXML(), function(err, validationErrors){
        // err contains any technical error 
        // validationError is an array, null if the validation is ok 
        validationErrors.message = err;
        (err === null).should.be.eql(true, validationErrors);
        if(_.contains(process.argv, "--toxml")) {
            console.log(workPacket.toXML());
        }
        done();
      });  
    });

  });
}