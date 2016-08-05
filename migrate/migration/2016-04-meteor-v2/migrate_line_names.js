
var util = require('dsp_tool/util');
var Line = require('dsp_model/geoschema');
function *run(fix){
  console.debug("run migration");
  var remove = ["LOS_BANOS_O'NEILL_PGP", "DELTA_MTN_GATE_JCT"];
  for(var i = 0; i < remove.length; i++) {
    var name = remove[i];
    var line = yield Line.findOne({name: name});
    if( line ) {
      console.log("Found line", name);
      if(fix) {
        console.log('Remove line', name);
        yield line.remove();
      } 
    } else {
      console.log("Found line not found", name);      
    }
  }
}

if (require.main === module) {
  var baker = require('dsp_tool/baker');
  util.bakerGen(run, {default:true});
  baker.run();
}
