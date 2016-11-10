// Dependencies
const co = require('co');
const regionDivLib = require('./region_div_lib');

// Connection
const config = require('dsp_shared/config/config').get({ log4js: false });
require('dsp_shared/database/database')(config.meteor);

// Collections
const Trees = require('dsp_shared/database/model/tree');
const Pmds = require('dsp_shared/database/model/pmd');

// Patch
var patchRegion = co.wrap(function*(APPLY) {
  var trees = yield Trees.find({ project: 'transmission_2015', region: { $exists: false }, status: /^[^06]/ });
  var count = 0;

  for (var i = 0; i < trees.length; i++) {
    var tree = trees[i];
    var region = null;
    var division = null;
    
    if (tree.division) {
      // Have division
      division = tree.division;
    } else if (tree.pge_pmd_num) {
      // Have pmd
      division = yield Pmds.findOne({ pge_pmd_num: tree.pge_pmd_num });
      division = division.division;
    } else {
      // Have nothing and cannot be fixed
      return;
    }
    region = regionDivLib[division];
    console.log(tree._id);

    if (APPLY) {
      try {
        var res =  yield Trees.update({ _id: tree._id }, { region: region });
        console.log(res);
      } catch(e) {
        console.error(e);
      }
    }
    count++;
  }
  console.log('===========================');
  console.log('TOTAL FOUND: ', trees.length);
  console.log('TOTAL FIXED: ', count);
});

if (require.main === module) {
  patchRegion(false);
}

module.exports = patchRegion;