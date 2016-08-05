var util = require('dsp_tool/util');

var PMDV3 = require('dsp_model/meteor_v3/pmd'); //updated schema
var PMD = require('dsp_model/pmd'); 

function *run(fix){

  var pmds = yield PMD.find();
  for(var i = 0; i < pmds.length; i++) {
    var pmd = pmds[i];
    var new_pmd = yield PMDV3.findOne({pge_pmd_num: pmd.pge_pmd_num});
    if(new_pmd.plan_tc_complete.getTime() !== pmd.plan_trim_complete.getTime()) {
      new_pmd.plan_tc_complete = pmd.plan_trim_complete;      
      new_pmd.created = pmd.created;      
      console.log("Adding trim complete date", new_pmd.name, new_pmd.pge_pmd_num, new_pmd.plan_tc_complete);
      if(fix) {        
        yield new_pmd.save();
      }      
    }
  }
}

if (require.main === module) {
  var baker = require('dsp_tool/baker');
  util.bakerGen(run, {default:true});
  baker.run();
}
