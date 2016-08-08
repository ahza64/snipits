var utils = require('dsp_shared/lib/cmd_utils');
utils.connect(['meteor']);
require("sugar");
var TreeV3 = require("dsp_shared/database/model/tree");
var fs = require('fs');
/**
 * [write_to_file writes the tree ids to file]
 * @param  {String} qsi_id qsi id of the tree
 * @return {Void}        void
 */
function write_to_file(qsi_id){
  fs.appendFileSync(__dirname + '/qsi_ids', qsi_id + '\n');
}

/**
 * run runs the script to correct the qsi_field values
 * @param {boolean} push         boolean to start updating
 * @param {string} qsi_field   field name for qsi schema
 * @param {string} dispatchr_field   field name for meteor schema
 * @yield {Array}}  retrun from mongo
 */
 function *run(push) {
  push = push || false;
  fs.writeFile(__dirname + '/qsi_ids', '', () => console.log('done') );
  console.time('query');
  var trees = yield TreeV3.find({flagged_not_routine:true}).select('qsi_id').exec();
  console.log(trees.length);
  console.timeEnd('query');
  trees.forEach( tree => write_to_file(tree.qsi_id) );

}


module.exports = run;
 
if (require.main === module) {
  var baker = require('dsp_shared/lib/baker');
  utils.bakerGen(run, {default:true}); 
  baker.run();  
}