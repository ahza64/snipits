console.log('running...')
var fix_circuit = require('./fake_project_name');
var utils = require('dsp_shared/lib/cmd_utils');
utils.connect(['meteor']);

function *run(push){
	push = push || false;
	
	yield fix_circuit( 'project', 'name', push);
}

if (require.main === module) {
  var baker = require('dsp_shared/lib/baker');
  utils.bakerGen(run, {default:true});
  baker.run();
}
