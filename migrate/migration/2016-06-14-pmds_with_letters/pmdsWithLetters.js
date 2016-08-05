var util = require('dsp_shared/lib/cmd_utils');
var _ = require('underscore');
util.connect(["meteor"]);

var PMD = require('dsp_shared/database/model/pmd');
var TREE = require('dsp_shared/database/model/tree');

/**
 *  pmdsWithLetters - return all pmds that contain letters
 *
 * @return {void}
 */
function *pmdsWithLetters(){
  var pmds = yield PMD.find({pge_pmd_num: new RegExp(/[a-zA-Z]+/)});
  _.each(pmds, function(pmd){
    console.log(pmd.pge_pmd_num);
  });
}

function *getBadPmds () {
  var badPmds = yield TREE.distinct('pge_pmd_num', {pge_pmd_num: new RegExp(/[a-zA-Z]+/)});
  return badPmds;
}

// baker module
if (require.main === module) {
 var baker = require('dsp_shared/lib/baker');
 util.bakerGen(pmdsWithLetters, {default:true});
 util.bakerGen(getBadPmds);
 baker.run();
}

// export
module.exports = {
  pmdsWithLetters: pmdsWithLetters,
  getBadPmds: getBadPmds
};
