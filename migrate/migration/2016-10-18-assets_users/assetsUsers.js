var util = require('dsp_shared/lib/cmd_utils');
util.connect(["meteor"]);

var Asset = require('dsp_shared/database/model/assets');
var Tree = require('dsp_shared/database/model/tree');
var stream = require('dsp_shared/database/stream');


/**
 * updateAsset
 *
 * @param  {String} id
 * @param  {String} imageType
 * @param  {String} userId
 * @return {void}
 */
function *updateAsset(id, imageType, userId){
  yield Asset.update({_id : id}, {'meta.imageType': imageType, 'meta.userId': userId});
}


/**
 * migrateUsers
 *
 * @return {void}
 */
function *migrateUsers(){
  var query = {
    $or : [
      {image: {$exists: true}},
      {tc_image: {$exists: true}},
      {ntw_image: {$exists: true}}
    ]
  };
  var treeCount = yield Tree.find(query).count();
  console.log('Number of Trees with Assets associated', treeCount);
  var tree_stream = stream(Tree, query);
  for( var tree of tree_stream){
    treeCount--;
    tree = yield tree;
    try {
      if(tree.image){
        yield updateAsset(tree.image, 'pi_image', tree.pi_user_id);
        console.log('Asset '+ tree.image + ' updated with user '+ tree.pi_user_id + ' from tree ' + tree._id);
      }
      if(tree.tc_image){
        yield updateAsset(tree.tc_image, 'tc_image', tree.tc_user_id);
        console.log('Asset '+ tree.tc_image + ' updated with user '+ tree.tc_user_id + ' from tree ' + tree._id);
      }
      if(tree.ntw_image){
        yield updateAsset(tree.ntw_image, 'ntw_image', tree.pi_user_id);
        console.log('Asset '+ tree.ntw_image + ' updated with user '+ tree.pi_user_id + ' from tree ' + tree._id);
      }
    } catch(e) {
      console.error('Exception', e.message);
    }
    console.log(treeCount);
  }
}

//baker module
if (require.main === module) {
  util.bakerGen(migrateUsers, {default: true});
  util.bakerRun();
}
