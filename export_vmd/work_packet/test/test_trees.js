/* globals describe, it */

var TreeRecord = require("../tree_record");

var test_util = require("./util");
var _ = require('underscore');

var trees = {
  tree1: require("./data/tree1.json"),
  tree2: require("./data/tree2.json"),  
  velb: require("./data/velb.json"),
  raptor: require("./data/raptor.json"),
  refused: require("./data/refused.json"),
  ntw_tree: require("./data/ntw_needed.json"),
  notify_customer: require("./data/notify_customer.json"),
  no_trim: require("./data/no_trim.json"),
};


describe("tree record tests", function(){
  for(var tree_type in trees) {
    if(trees.hasOwnProperty(tree_type)){
      var tree = trees[tree_type];  
      createTest(tree_type, tree);
    }
  }
}); 


function createTest(tree_type, tree) {
  it("tree "+tree_type+" should match results", function(){
    var treeRecord = loadTreeRecord(tree);
    test_util.testResults(tree.results, "tree", tree_type, treeRecord.record);
  });
}

function loadTreeRecord(tree) {
  var tree_data = _.extend({}, tree.data);
  var inspector = _.extend({}, tree_data.pi_user);
  var line = _.extend({}, tree_data.line);
  var pmd = _.extend({}, tree_data.pmd);
  if(tree_data.image) {
    var image = _.extend({}, tree_data.image);
  }

  delete tree_data.inspector;
  delete tree_data.line;
  delete tree_data.pmd;
  delete tree_data.file;
  return new TreeRecord(tree_data, inspector, line, pmd, image);   
}

module.exports = {
  loadTreeRecord: loadTreeRecord
};