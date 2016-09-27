/* globals describe, it */

var WorkComplete = require("../work_complete/work_complete");
var WorkPacket = require("../work_packet/work_packet");
var TreeLocation = require("../work_packet/tree_location");
var TreeRecord = require("../work_packet/tree_record");

var test_util = require("./util");
var _ = require('underscore');

var trees = {
  worked: require("./data/worked.json"),
  worked2: require("./data/worked2.json"),
  worked3: require("./data/worked3.json"),
};


describe("work complete tests", function(){
  for(var tree_type in trees) {
    if(trees.hasOwnProperty(tree_type)){
      var tree = trees[tree_type];  
      createTest(tree_type, tree);
    }
  }
}); 


function createTest(tree_type, tree) {
  it("tree "+tree_type+" should match results", function(){
    
    
    var workComplete = loadWorkComplete(tree);
    // console.log(workComplete);
    test_util.testResults(tree.results, "tree", tree_type, workComplete.work_complete);
  });
}

function loadWorkComplete(tree) {
  var tree_data = _.extend({}, tree.data);
  var inspector = _.extend({}, tree_data.pi_user);
  var trimmer = _.extend({}, tree_data.tc_user);  
  var line = _.extend({}, tree_data.line);
  var pmd = _.extend({}, tree_data.pmd);
  
  if(tree_data.image) {
    var image = _.extend({}, tree_data.image);
  }

  delete tree_data.pi_user;
  delete tree_data.tc_user;  
  delete tree_data.line;
  delete tree_data.pmd;
  delete tree_data.file;
  var record = new TreeRecord(tree_data, inspector, line, pmd, image);   
  var loc = new TreeLocation();
  loc.addTree(record);
  var packet = new WorkPacket();
  packet.addLocation(loc);
  // console.log(packet.toXML());
  
  var work_complete = new WorkComplete(tree_data, trimmer);
  // console.log(work_complete.toXML());
  
  return work_complete;
}

module.exports = {
  loadWorkComplete: loadWorkComplete
};