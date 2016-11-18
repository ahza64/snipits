var BackboneService = require('dsp_service');

if (require.main === module) {
  var baker = require('dsp_shared/lib/baker');  
  baker.command(function test() {
    console.log("TESTING");
    var backbone = new BackboneService('test', function(message, reply){
      console.log("MESSAGE", message);
      reply(['test-test', 'reply']);
    });
    backbone.connect();
    
  }, {default: true});
  baker.run();
}
