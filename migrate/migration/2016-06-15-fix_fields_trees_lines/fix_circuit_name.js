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

function *run(collection, field, push){
	var name_field ={
		'line': 'name',
		'tree': field
	};
	push = push || false;
	var circuit_names = 
				[{	
					"old": "DELT_MTN_GATE_JCT",
					"new": "DELTA_MTN_GATE_JCT"
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
