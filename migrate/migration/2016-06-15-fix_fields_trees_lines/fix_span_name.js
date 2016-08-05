var migrate_fix = require('./migrate_fix');
var utils = require('dsp_shared/lib/cmd_utils');
utils.connect(['meteor']);

function *run(push){
	push = push || false;
	yield migrate_fix('tree', 'SPAN_NAME', 'span_name', push);
}

function *test() {
  var Tree = require("dsp_shared/database/model/tree");
  
  var count = yield Tree.find({span_name: null}).count();
  console.log("Trees without span_name:", count);
  return count === 0;
}

if (require.main === module) {
  var baker = require('dsp_shared/lib/baker');
  utils.bakerGen(run, {default:true});  
  utils.bakerGen(test);    
  baker.run();  
}

module.exports = {fix: run, test: test};