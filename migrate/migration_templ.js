var migrate_util = require('./util');
var util = require('dsp_shared/cmd_util');

var migrationScema = {
  key: "src_key",
  key_two: function(resource){
    return resource.do_calculations;
  },
  key_three: function*(resource){
    return yield resource.run_generator;
  }  
};

function *run(fix){
  console.debug("run migration");
  var resources = [];
  for(var i = 0; i < resources.length; i++) {
    var resource = resources[i];
    var migrated = yield migrate_util.applyMigrationSchema(migrationScema, resource);
    if(fix) {        
      migrated.save();
    }
  }
}

if (require.main === module) {
  var baker = require('dsp_tool/baker');
  util.bakerGen(run, {default:true});
  baker.run();
}
