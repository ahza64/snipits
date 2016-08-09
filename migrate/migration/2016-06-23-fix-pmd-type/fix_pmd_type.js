/**
 * @description Specific tool for fixing typo 'System Maintenence' in attribute type of projects collection
 */
var util = require('dsp_shared/lib/cmd_utils');
util.connect(['meteor']);
var PMD = require('dsp_shared/database/model/pmd');
var typoType = 'System Maintenence';
var correctType = 'System Maintenance';

function *getBadType() {
  var badPmdIds = yield PMD.find({type: typoType}, {_id: 1});
  if (badPmdIds.length === 0) {
    return [];
  }
  badPmdIds = badPmdIds.map(x => x._id);
  return badPmdIds;
}

function *updateBadPmdsType() {
  var ids = yield getBadType();
  if (ids.length === 0) {
    console.log('No bad type is found in projects');
    return;
  }
  console.log('updating ids: ', ids);
  var res = yield PMD.update({_id: {$in: ids}}, {$set: {type: correctType}}, {multi: true});
  console.log('updated', res);
}

// baker module
if (require.main === module) {
  var baker = require('dsp_shared/lib/baker');
  util.bakerGen(getBadType, {default: true});
  util.bakerGen(updateBadPmdsType);
  baker.run();
}

// export
module.exports = {
  getBadType: getBadType
};