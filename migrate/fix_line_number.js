var migrate_fix = require('./lib/migrate_fix');
var utils = require('dsp_shared/lib/cmd_utils');
utils.connect(['meteor']);

function *run(push){
	push = push || false;
	yield migrate_fix('line', 'LINE_NBR', 'line_number', push);
}

if (require.main === module) {
  var baker = require('dsp_shared/lib/baker');
  utils.bakerGen(run, {default:true});  
  baker.run();  
}