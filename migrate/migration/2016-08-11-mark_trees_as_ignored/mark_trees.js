/**
 * @fileoverview There is a set of 214 trees that are missing PMD numbers but are not part of a transmission projects.  
 * This is special migration to mark these trees as ignored and add a comment to say why.
 */


var utils = require('dsp_shared/lib/cmd_utils');
utils.connect(['meteor', 'postgres']);

const Tree = require('dsp_shared/database/model/tree');
const stream = require('dsp_shared/database/stream');
const TreeHistory = require('dsp_shared/database/model/tree-history');

String.prototype.replaceAt=function(index, character) {
    return this.substr(0, index) + character + this.substr(index+character.length);
};

function *run(fix) {
  var query = {status: /^[1-5]/, pge_pmd_num: null, circuit_name: "EXCHEQUER_YOSEMITE"};
  var count = yield Tree.find(query).count();
  console.log("Updating Trees:", count);
  for(var treep of stream(Tree, query)) {
    var tree = yield treep;
    if(tree) {
      console.log("PROCESSING TREE", tree._id);
      var old_tree = utils.toJSON(tree);
      if(fix) {
        tree.status = tree.status.replaceAt(0, '0');
        tree.comments = "Tree not routine.  No PMD via QSI: Jamie and Tarin";
        console.log("OLD", tree._id, old_tree.status, old_tree.comments);
        console.log("NEW", tree._id, tree.status, tree.comments);
        var mig_user = {_id: "mark_tree_as_ignored", type: "Migration"};
        yield TreeHistory.recordTreeHistory(old_tree, tree, mig_user, null, 'mark_tree_as_ignored_migration');
        yield tree.save();
      }
    }
  }  
}


if (require.main === module) {
  utils.bakerGen(run, {default:true});  
  utils.bakerRun();  
}
