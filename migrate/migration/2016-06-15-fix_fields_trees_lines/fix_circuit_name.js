#!/bin/env node
/*
  @author tw3rp
  @fileoverview corrects circuit names in trees
*/
var utils = require('dsp_shared/lib/cmd_utils');
var _ = require('underscore');
utils.connect(['meteor']);

var TreeV3 = require("dsp_shared/database/model/tree");
var Line = require("dsp_shared/database/model/circuit");

var model_name ={
	'line': Line,
	'tree': TreeV3
};

var name_field ={
	'line': 'name',
	'tree': 'circuit_name'
};

function *run(collection, push){
	push = push || false;
	var circuit_names = 
				[{	
					"old": "LOS_BANOS_O'NEILL_PGP",
					"new": "LOS_BANOS_O_NEILL_PGP"
				},
				{ "old": "BOTTLE_ROCK_TAP_D.W.R.",
					"new": "BOTTLE_ROCK_TAP_DWR"
				},
				{ "old": "DELTA_MTN_GATE_JCT", 
					"new": "DELT_MTN_GATE_JCT"
				},
				{ "old": "METCALF_HICKS_1_IDLE",
					"new": "METCALF_HICKS_1_2_IDLE"
				},
				{ "old": "7TH_STANDARD_KERN",
					"new": "SEVENTH_STANDARD_KERN"
				}];
	for (var i = 0; i < circuit_names.length; i++) {
		var circuit_name = circuit_names[i];
		console.log('checking circuit name: ', circuit_name.old);
		var query = {};
		query[ name_field[ collection ] ] = circuit_name.old;
		var fields = {};
		fields[ name_field[ collection ] ] = 1;

		var trees = yield model_name[collection].find( query,fields ).exec();
		var none_found = false;
		if( trees.length === 0){
			console.log("no documents found");
			none_found = true;
		}
		_.each(trees, tree => console.log(tree, "will be updated") );
		
		if(push && !none_found){
			console.log('updating ', collection, " oldvlaue:  ", circuit_name.old, " new value: ", circuit_name.new );
			var set = {};
			set[ name_field[collection] ] = circuit_name.new;
			yield model_name[collection].update(query , { $set: set }, { multi: true}).exec();
		}
	}
}

module.exports = run;

if (require.main === module) {
  var baker = require('dsp_shared/lib/baker');
  utils.bakerGen(run, {default:true});  
  baker.run();  
}