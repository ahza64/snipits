

function findWOTrees(tree){  
  var trees = Tree.find({pge_pmd_num: tree.pge_pmd_num, span_name: tree.span_name});

}

var inspect_wo = {}
var 
function findExportWO(trees){
  var tree_ids = _.indexBy(trees, function(tree) { return tree.qsi_id || tree._id.toString(); });
  var exports = yield Export.find({type: "trees", "data.TREE_ID": {$in: tree_ids}});
  
  
  
  
}







function createWO(cuf_id, trees) {
  

}


