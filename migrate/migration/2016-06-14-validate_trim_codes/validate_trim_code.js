/**
 * @description Tools for checking if trees collection exists bad trim codes
 */
var _ = require('underscore');
var util = require('dsp_shared/lib/cmd_utils');
util.connect(['meteor']);
var TREE = require('dsp_shared/database/model/tree');
var origin_trim_codes = require('dsp_shared/lib/pge_vmd_codes').trim_codes;
var correct_trim_codes = Object.keys(origin_trim_codes);

/**
 * Check if there are bad trim codes
 * 
 * @return {Array} return bad trim codes
 */
function *getBadTrimCodes () {
  var bad_trim_codes = [];
  var trim_codes = yield TREE.distinct('trim_code', {});

  trim_codes.forEach(code => {
    if (!_.contains(correct_trim_codes, code)) {
      bad_trim_codes.push(code);
    }
  });

  return bad_trim_codes;
}

// baker module
if (require.main === module) {
  var baker = require('dsp_shared/lib/baker');
  util.bakerGen(getBadTrimCodes, {default:true});
  baker.run();
}

// export
module.exports = {
  getBadTrimCodes: getBadTrimCodes
};