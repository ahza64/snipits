const util = require('dsp_shared/lib/cmd_utils');

util.connect(["meteor"]);

const stream = require('dsp_shared/database/stream');
const Tree = require('dsp_shared/database/model/tree');
const Pmd = require('dsp_shared/database/model/pmd');
const NewTree = require('dsp_shared/database/model/flatTree');
const statusLib = require('../../../../tree-status-codes/index');

function *migrateStatusCode() {
  const pmds = yield Pmd.find({});
  const query = {
    project: 'transmission_2015'
  };
  const tree_stream = stream(Tree, query);
  for (let tree of tree_stream) {
    tree = yield tree;
    const pmd = pmds.find((p) => {
      return p.pge_pmd_num === tree.pge_pmd_num;
    });

    const statusFlags = statusLib.fetchStatusFlags(tree.status);
    statusFlags.status_code = tree.status;
    statusFlags.pge_pmd_name = pmd ? pmd.name : null;
    const newTree = Object.assign(tree.toJSON(), statusFlags);

    yield NewTree.collection.insert(newTree);
    console.log('Successfully inserted', newTree.inc_id);
  }
}

// baker module
if (require.main === module) {
  util.bakerGen(migrateStatusCode, { default: true });
  util.bakerRun();
}
