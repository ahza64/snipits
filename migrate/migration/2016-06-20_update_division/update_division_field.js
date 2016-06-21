var _ = require('underscore');
var utils = require('dsp_shared/lib/cmd_utils');
utils.connect(['meteor']);
var Tree = require('dsp_shared/database/model/tree');
var PMD = require('dsp_shared/database/model/pmd');

function *run(push){
	var trees = yield Tree.find( { division: null, project: 'transmission_2015', pge_pmd_num: { $ne: null } }, { pge_pmd_num:1 }).exec();
	var project_nums = _.groupBy(trees, tree => tree.pge_pmd_num);
	if(trees.length === 0){
		console.log('no documents found');
	}
	else{
		for(var pge_pmd_num in project_nums){
			var onlyIds = _.map( project_nums[pge_pmd_num], tree => tree._id);
			console.log(onlyIds);
			var division = yield PMD.find( { pge_pmd_num: pge_pmd_num }, { division:1 , _id:0 } );
			console.log("Trees ", onlyIds, " will be updated with division", division[0].division);
			if(push){
				console.log("Trees ", onlyIds, " are updating with division", division[0].division);
				yield Tree.update({ _id: { $in: onlyIds}}, { $set: { division : division[0].division } }, { multi: true }).exec();
			}
		}
	}
}

if (require.main === module) {
  var baker = require('dsp_shared/lib/baker');
  utils.bakerGen(run, {default:true});  
  baker.run();  
}