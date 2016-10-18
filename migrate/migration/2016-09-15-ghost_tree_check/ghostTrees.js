var BPromise = require('bluebird');
var util = require('dsp_shared/lib/cmd_utils');
util.connect(["meteor"]);

var Tree = require('dsp_shared/database/model/tree');
var createCSV = require('dsp_shared/lib/write_csv');

function *ghostTreeCheck(){
  var query = {
    project: 'transmission_2015',
    status: /^[^06]/
  }
  var data = [];
  var trees = Tree.find(query).stream();
  var treeCount = 0;
  var ghostTreeCount = 0;
  return yield new BPromise(function (resolve, reject){
    trees.on('data', function(doc){
      this.pause();
      Tree.find({'location.coordinates': doc.location.coordinates, _id:{$ne:doc._id}}).count().then(function(duplicateTrees){
        if(duplicateTrees > 0){
          data.push({
            treeId : doc._id,
            inc_id : doc.inc_id,
            qsi_id : doc.qsi_id,
            location : doc.location.coordinates,
            project : doc.pge_pmd_num,
            division : doc.division,
            region : doc.region
          });
          console.log('FOUND A DUPLICATE TREE AT', doc.inc_id);
          ghostTreeCount++;

        } else {
          treeCount++;
          console.log('NO GHOST TREE HERE: ', treeCount);
        }
      });

      this.resume();
    });

    trees.on('error', function (err) {
      // handle err
      console.error(err);
      reject(err);
    });

    trees.on('close', function () {
      // all done
      console.log(treeCount, ghostTreeCount);
      console.log("ALL DONE");
      console.log('Generating CSV....');
      var fields = ['treeId', 'inc_id', 'qsi_id', 'location', 'project', 'division', 'region'];
      createCSV(fields, data, 'ghostTrees.csv');
      resolve();
    });
  });
}

//baker module
if (require.main === module) {
  util.bakerGen(ghostTreeCheck, {default: true});
  util.bakerRun();
}
