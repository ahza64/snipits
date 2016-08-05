var util = require('dsp_tool/util');
var TreeV2 = require('dsp_model/tree');
var TreeV3 = require('dsp_model/meteor_v3/tree'); //updated tree schema

function *run(fix){
  console.debug("run migration");
  var trees = yield TreeV2.find({"properties.comments": {$ne: null}}).select('_id properties').lean();  
  console.log("found trees", trees.length);
  for(var i = 0; i < trees.length; i++) {
    var tree = trees[i];
    console.log("Looking for tree", tree._id, tree.properties.comments);
    if(fix) {
      var tree_updated = yield TreeV3.update({_id: tree._id, comments: {$in: [null, '']}}, {$set: {comments: tree.properties.comments}});
      if(tree_updated.n === 1) {
        console.log("Tree updated", tree._id);
      }
    }
  }  
}

if (require.main === module) {
  var baker = require('dsp_tool/baker');
  util.bakerGen(run, {default:true});
  baker.run();
}
