#!/bin/env node
/*
  @author tw3rp
  @fileoverview corrects circuit names in projects
*/
var utils = require('dsp_shared/lib/cmd_utils');
var _ = require('underscore');
utils.connect(['meteor']);

var Project = require("dsp_shared/database/model/pmd");
var Line = require("dsp_shared/database/model/circuit");

var model_name ={
	'line': Line,
	'project': Project
};

function *run(collection, field, push){
	console.log('running...');
	var name_field ={
		'line': 'name',
		'project': field
	};
	push = push || false;
	console.log('searching for projects ');
	var tree_project_names = yield  model_name[collection].find().distinct('name').exec();
	console.log(tree_project_names);
	var project_names = [];
	tree_project_names.forEach((project_name,i) => project_names.push({
			"old": project_name,
			"new": 'Project '+ i
		})
	);
	console.log(project_names);
	for (var i = 0; i < project_names.length; i++) {
		var project_name = project_names[i];
		console.log('checking circuit name: ', project_name.old);
		var query = {};
		query[ name_field[ collection ] ] = project_name.old;
		var fields = {};
		fields[ name_field[ collection ] ] = 1;

		var projects = yield model_name[collection].find( query,fields ).exec();
		var none_found = false;
		if( projects.length === 0){
			console.log("no documents found");
			none_found = true;
		}
		_.each(projects, project => console.log(project, project_name, "will be updated") );

		if(push && !none_found){
			console.log('updating ', collection, " oldvlaue:  ", project_name.old, " new value: ", project_name.new );
			var set = {};
			set[ name_field[collection] ] = project_name.new;
			yield model_name[collection].update(query , { $set: set }, { multi: true}).exec();
		}
	}
}

module.exports = run;