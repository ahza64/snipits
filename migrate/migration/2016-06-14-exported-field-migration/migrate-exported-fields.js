const _ = require('underscore');

const util = require('dsp_shared/lib/cmd_utils');
util.connect(['meteor', 'trans']);

const TreeV2 = require('dsp_shared/database/model/trans/tree');
const TreeV3 = require('dsp_shared/database/model/tree'); //updated tree schema
const BATCH_SIZE = 500;

function *run(){
  var tree_count = 0;
  console.log("looking up exported trees");
  var v2treeCount = yield TreeV2.find({ exported: { $exists: true, $ne: null }}).count();
  console.log('Found #' + v2treeCount + ' with exported field');
  var pages = v2treeCount/BATCH_SIZE;
  for(var i = 0; i < pages; i++) {
    console.log("Migrating Batch", i, (i+1)*BATCH_SIZE)
    var v2trees = yield TreeV2.find({ exported: { $exists: true, $ne: null }}).limit(BATCH_SIZE).skip(i*BATCH_SIZE);
    var v3trees = yield TreeV3.find({ _id: { $in: v2trees.map(tree => tree._id) }});
    for(var j = 0; j < v2trees.length; j++) {
      tree_count++;
      var v2tree = v2trees[j];
      var v3tree = _.find(v3trees, tree => tree._id.toString() === v2tree._id.toString()); // || {project: 'transmission_2015'};

      if(v3tree) {
        var updated = yield TreeV3.findOneAndUpdate({ _id: v3tree._id }, { exported: v2tree.exported}, { upsert: true });
        if(!updated) {
          console.error("Tree v3 not update", v3tree._id);
        }
      } else {
        console.log("COULD NOT FIND TREE SCHEMA", v2tree._id);
      }
    }
  }
}

if (require.main === module) {
  util.bakerGen(run, {default:true});
  util.bakerRun();
}
