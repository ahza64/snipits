/**
 * @fileoverview There is a set of 214 trees that are missing PMD numbers but are not part of a transmission projects.  
 * This is special migration to mark these trees as ignored and add a comment to say why.
 */


var utils = require('dsp_shared/lib/cmd_utils');
utils.connect(['meteor', 'trans', 'postgres']);

// const Tree = require('dsp_shared/database/model/tree');
const stream = require('dsp_shared/database/stream');
const TreeHistory = require('dsp_shared/database/model/tree-history');

const v2ToV3Migrate = require("dsp_migrate/migration/2016-04-meteor-v2/tree_v2_to_tree_v3")._migrateTree;

const TransTree = require('dsp_shared/database/model/trans/tree');
const TransPatch = require('dsp_shared/database/model/trans/patch');

const transTreeSchmeaUpdate = require('dispatchr-javascript-utils').migrate_tree;

const Grid = require('dsp_shared/database/model/trans/grid');

var deletd_moraga_2 ={
    "name" : "MORAGA_OAKLAND_2",
    "_id" : "564ade3f78b391d26af39f6d"
};
var deletd_moraga_3 = {
    "name" : "MORAGA_OAKLAND_3",
    "_id" : "564ade8c78b391d26af3a2e6"
};
var deletd_moraga_4 = {
    "name" : "MORAGA_OAKLAND_4",
    "_id" : "564adeaa78b391d26af3a70c"
};


// db.getCollection('users').update({_id: ObjectId("566f4904d45c85303a350ac4")}, {$set: {vehicle: "5654cfde2895a53d284117d1"}})

function *run() {
  
  yield Grid.update({_id: deletd_moraga_2._id}, deletd_moraga_2, {upsert: true});
  yield Grid.update({_id: deletd_moraga_3._id}, deletd_moraga_3, {upsert: true});
  yield Grid.update({_id: deletd_moraga_4._id}, deletd_moraga_4, {upsert: true});
  
  
  var query = {_id: "565372ac539dc97c02f0b7a9"};
  var count = yield TransTree.find(query).count();
  var i = 0;
  for(var treep of stream(TransTree, query)) {
    var tree = yield treep;
    if(tree) {
      if(i++%1000 === 0) {
        console.log("Tree", i, "of", count);
      }
      var ver = 0;
      var prev = {};
      console.log("TREE", tree._id);
      for(var version of TransPatch.versionIterator("Tree", tree._id)){
        version = yield version;
        if(version) {
          ver++;
          version = transTreeSchmeaUpdate(version);          
          // console.log("V2 VERSION", version);  
          version = yield v2ToV3Migrate(version);
          var mig_user = {_id: 'tree_patch_to_history', type:"Migration"};
          // console.log("V3 VERSION", version);
          var history_rec = yield TreeHistory.recordTreeHistory(prev, version, mig_user, version.updated);
          // console.log("TREE HISTORY", history_rec);
          prev = version;
        }
      }
    }
  }  
}


if (require.main === module) {
  utils.bakerGen(run, {default:true});  
  utils.bakerRun();  
}
