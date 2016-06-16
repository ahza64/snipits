/**
 * @description Tools for db connections in baker command line utilities
 */
var _ = require('underscore');
var co = require('co');
var timer = require('co-timer');
var config = require('dsp_config/config').get();	
var BPromise = require('bluebird');

var baker = require('./baker');

var connections = null;

function *waitForConnections(){
  for(var name in connections) {
    if(connections.hasOwnProperty(name)) {
      yield connections[name].connected;
    }
  }
}

function connect(connection_names) {
  if(!connections) {
    if(!connection_names) {
      connection_names = ['trans', 'meteor'];
    }      
    connections = {};
    for(var i = 0; i < connection_names.length; i++) {

      var name = connection_names[i];
      if(!connections[name]) {
        connections[name] = require('dsp_database/database')(config[name]);
      }      
    }
  }
} 


function closeConnections() {
  for(var name in connections) {
    if(connections.hasOwnProperty(name)) {
      console.log("CLOSING", name);
      connections[name].connection.close();
    }
  }
}

function bakerGen(gen, options) {
  if(!baker) {
    baker = require('dsp_lib/baker');
  }
  options = options || {};    
  connect(options.dbs);
  options.parameters = baker.getParams(gen);
  options.command = gen.name;
  console.log(options);
  baker.command(function*(){
    yield waitForConnections();    
    console.log("RUNNING");    
    var result = yield gen.apply(this, arguments);
    yield timer(3000);
    closeConnections();
    return result;
  }, options);    
  return baker;
}

function generatorWithDb(gen) {
  console.log("configs", config.dispatchr);
  connect();

  return new BPromise(function(resolve){//, reject)  {
    co(function*(){
      console.log("RUNNING Generator", gen);  
      yield waitForConnections();
      var result = yield gen;
      resolve(result);
    });
  }).finally(function(){
    setTimeout(function(){
      closeConnections();
    }, 3000);
  });
}

function withDb(func, args) {
  console.log("ARGS", args);
  connect();
  var res = func.apply(this, args);
  console.log(res);
  return res.finally(function(){
    closeConnections();
  });
}


function dumpAsCSV(row_data, tabs) {
  tabs = tabs || false;
  var headers = _.keys(row_data[0]);
  var delim = ',';
  if(tabs) {
    delim = "\t";
  }
  var rows = [headers.join(delim)];
  _.each(row_data, function(value) {
    var row = [];
    for(var i = 0; i < headers.length; i++) {
      row.push(value[headers[i]]);
    }
    // console.log("CREATED ROW", row);
    rows.push(row.join(delim));
  });
  return rows.join("\n");
}

module.exports = {
  connect: connect,
	dumpAsCSV: dumpAsCSV,
	withDb: withDb,
	generatorWithDb: generatorWithDb,
  bakerGen: bakerGen,
  bakerRun: function() {
    baker.run();
  }
  
};
