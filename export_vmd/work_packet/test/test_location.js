/* globals describe, it */
var TreeLocation = require("../tree_location");
var test_tree = require("./test_trees");
var test_util = require("./util");

var locations = {
  location1: require("./data/location1.json")
};


describe("tree location tests", function(){
  for(var loc_name in locations) {
    if(locations.hasOwnProperty(loc_name)){
      var loc = locations[loc_name];  
      createTest(loc_name, loc);
    }
  }
}); 


function createTest(loc_name, loc) {
  it("can create locaiton for trees: "+loc_name, function(){
    var treeLocation = loadLocation(loc);
    
    test_util.testResults(loc.results, "tree_location", loc_name, treeLocation.location);
    // console.log(treeLocation.toXML());
  });
}

function loadLocation(loc){
  var treeLocation = new TreeLocation();
  for(var i = 0; i < loc.trees.length; i++) {
    var tree_name = loc.trees[i];
    var tree = require("./data/"+tree_name+".json");
    var treeRecord = test_tree.loadTreeRecord(tree);
    treeLocation.addTree(treeRecord);      
  }
  return treeLocation;
}

module.exports = {
  loadLocation: loadLocation
};