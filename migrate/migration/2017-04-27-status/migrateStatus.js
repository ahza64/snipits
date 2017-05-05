const util = require('dsp_shared/lib/cmd_utils');
util.connect(["meteor"]);

const stream = require('dsp_shared/database/stream');
const Tree = require('dsp_shared/database/model/tree');
const Pmd = require('dsp_shared/database/model/pmd');
const NewTree = require('dsp_shared/database/model/flatTree');
const statusLib = require('../../../../tree-status-codes/index');

const _ = require('underscore');

function *migrateStatusCode() {

  const pmds = yield Pmd.find({});
  var query = {
    project: 'transmission_2015'
  };
  var tree_stream = stream(Tree, query);
  for(var tree of tree_stream) {
    tree = yield tree;
    var pmd = pmds.find((p) => {
      return p.pge_pmd_num === tree.pge_pmd_num;
    });
    var statusFlags = statusLib.fetchStatusFlags(tree.status);
    statusFlags.status_code = tree.status;
    statusFlags.pge_pmd_name = pmd.name;
    var newTree = Object.assign(tree.toJSON(), statusFlags);

    NewTree.collection.insert(newTree, (err) => {
      if(err) {
        console.error(err);
      } else {
        console.log('Successfully inserted', newTree.inc_id);
      }
    });
  }
}

//baker module
if (require.main === module) {
  util.bakerGen(migrateStatusCode, {default: true});
  util.bakerRun();
}
