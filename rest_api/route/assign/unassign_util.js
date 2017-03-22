const Cufs = require('dsp_shared/database/model/cufs');
const Tree = require('dsp_shared/database/model/tree');
const Pmds = require('dsp_shared/database/model/pmd');
const moment = require('moment');
const _ = require('underscore');
var mongoose = require('mongoose');

module.exports = {
  *unassignPmd(pmd, cufId) {
    return yield Pmds.update({ pge_pmd_num: pmd}, { $pull: {cufs: cufId}});
  },

  *unassignCuf(pmd, cufId) {
    return yield Cufs.update({ _id: cufId}, {$pull: {workorder: {pge_pmd_num: pmd}}});
  },

  *unassignTrees(pmd, cufId) {
    return yield Tree.update({ pge_pmd_num: pmd, assigned_user_id: cufId }, {$set: {assigned_user_id: null}}, {multi: true});
  }
};
