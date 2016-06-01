/**
 * @description Tools for db connections in baker command line utilities
 */
var _ = require('underscore');
var co = require('co');
var timer = require('co-timer');
var config = require('dsp_config/config').get();	
var BPromise = require('bluebird');

var baker = require('./baker');
require('dsp_database/database')(config.dispatchr);
require('dsp_database/database')(config.meteor);

function bakerGen(gen, options) {
  if(!baker) {
    baker = require('dsp_lib/baker');
  }
  options = options || {};
  var db1 = require('dsp_database/database')(config.meteor);  
  var db2 = require('dsp_database/database')(config.dispatchr);
  
  options.parameters = baker.getParams(gen);
  options.command = gen.name;
  console.log(options);
  baker.command(function*(){
    console.log("RUNNING");
    var result = yield gen.apply(this, arguments);
    yield timer(3000);
    db1.connection.close();
    db2.connection.close();
    return result;
  }, options);    
  return baker;
}

function generatorWithDb(gen) {
  console.log("configs", config.dispatchr);
  var db1 = require('dsp_database/database')(config.meteor);  
  var db2 = require('dsp_database/database')(config.dispatchr);

  return new BPromise(function(resolve){//, reject)  {
    co(function*(){
      console.log("RUNNING Generator", gen);  
      yield db1.connected;
      yield db2.connected;
      var result = yield gen;
      resolve(result);
    });
  }).finally(function(){
    setTimeout(function(){
      db1.connection.close();
      db2.connection.close();
    }, 3000);
  });
}

function withDb(func, args) {
  console.log("ARGS", args);
  var db = require('dsp_database/database')(config.dispatchr);
  var res = func.apply(this, args);
  console.log(res);
  return res.finally(function(){
    db.connection.close();
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
	dumpAsCSV: dumpAsCSV,
	withDb: withDb,
	generatorWithDb: generatorWithDb,
  bakerGen: bakerGen
};
