var util = require('dsp_shared/lib/cmd_utils');
util.connect(["meteor"]);

var stream = require('dsp_shared/database/stream');

var Tree = require('dsp_shared/database/model/tree');
var createCSV = require('dsp_shared/lib/write_csv');

function *ghostTreeCheck(){
  var query = {
    project: 'transmission_2015',
    status: /^[^06]/,
    qsi_id: {$exists: true}
  };
  var data = [];
  var tree_stream = stream(Tree, query);
  var treeCount = 0;
  var ghostTreeCount = 0;

  for(var tree of tree_stream){
    tree = yield tree;
    var duplicateTrees = yield Tree.find({'location.coordinates': tree.location.coordinates, _id:{$ne:tree._id}}).count();
    if(duplicateTrees > 0){
      data.push({
        treeId : tree._id,
        inc_id : tree.inc_id,
        qsi_id : tree.qsi_id,
        location : tree.location.coordinates,
        project : tree.pge_pmd_num,
        division : tree.division,
        region : tree.region
      });
      console.log('FOUND A DUPLICATE TREE AT', tree.inc_id);
      ghostTreeCount++;

    } else {
      treeCount++;
      console.log('NO GHOST TREE HERE: ', treeCount);
    }
  }
  console.log(treeCount, ghostTreeCount);
  console.log("ALL DONE");
  console.log('Generating CSV....');
  var fields = ['treeId', 'inc_id', 'qsi_id', 'location', 'project', 'division', 'region'];
  createCSV(fields, data, 'ghostTrees.csv');
}

function *ghostTreeCheckQSI(){
  var query = {
    project: 'transmission_2015',
    status: /^[^06]/
  };
  var data = [];
  var tree_stream = stream(Tree, query);
  var treeCount = 0;
  var ghostTreeCount = 0;

  for(var tree of tree_stream){
    tree = yield tree;
    var duplicateTrees = yield Tree.find({'location.coordinates': tree.location.coordinates, _id:{$ne:tree._id}}).count();
    if(duplicateTrees > 0){
      data.push({
        treeId : tree._id,
        inc_id : tree.inc_id,
        location : tree.location.coordinates,
        project : tree.pge_pmd_num,
        division : tree.division,
        region : tree.region
      });
      console.log('FOUND A DUPLICATE TREE AT', tree.inc_id);
      ghostTreeCount++;

    } else {
      treeCount++;
      console.log('NO GHOST TREE HERE: ', treeCount);
    }
  }
  console.log(treeCount, ghostTreeCount);
  console.log("ALL DONE");
  console.log('Generating CSV....');
  var fields = ['treeId', 'inc_id', 'location', 'project', 'division', 'region'];
  createCSV(fields, data, 'ghostTrees.csv');
}

//baker module
if (require.main === module) {
  util.bakerGen(ghostTreeCheck, {default: true});
  util.bakerGen(ghostTreeCheckQSI);
  util.bakerRun();
}
