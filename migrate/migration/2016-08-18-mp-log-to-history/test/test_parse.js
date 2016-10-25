/* globals describe, it */
require('dsp_shared/config/config').get({log4js : false});
var parse_file = require('../parse_file');
var co = require('co');
var path = require('path');
var test_data = {
  // 'assign': require('./data/assign.json'),
  // 'unassign': require('./data/unassign.json'),
  // 'edit': require('./data/edit.json'),
  // 'push': require('./data/push.json'),
  // 'assign_unassign': require('./data/assign_unassign.json'),
  // 'mixed_assign_push': require('./data/mixed_assign_push.json'),
  'tree_edit': require('./data/tree_edit.json'),
  'push_with_delete_crew': require('./data/push_w_delete_crew.json')
};


describe("test mp log parase", function(){
  for(var test_name in test_data) {
    if(test_data.hasOwnProperty(test_name)){
      var test = test_data[test_name];  
      createTest(test_name, test);
    }
  }
}); 


function createTest(tree_type, test) {
  it("tree "+tree_type+" should match results", function(done){
    var full_path = path.dirname(__filename)+"/"+test.log_file;
    co(function*(){
      var result = yield parse_file(full_path);
      test.expected = test.expected || [];
            
      console.log("result", result);
      // console.log("expected", test.expected);
      for(var i = 0; i < test.expected.length; i++) {
        testResults(test.expected[i], "", tree_type, result[i]);      
      }  
      console.log('test', tree_type)
      done(); 
      
    })
    .catch((err) => { 
      setTimeout(function() { throw err; }); // Trying to fail test here but promise is eating exception
    });
  });
}


var should = require("should");

function testResults(expected, type, name, value){
  for(var key in expected) {
    if(expected.hasOwnProperty(key)) {
      if(expected[key] === null) {
        (value[key] === null).should.be.eql(true, type+" "+name+" "+key+" should be null");
      } else {
        if(Array.isArray(expected[key])) {
          testArray(expected[key], type, name+" "+key, value[key]);
        } else {
          (value === undefined).should.eql(false, type+" "+name+" "+key+" should exist");
          if(value[key] instanceof Date) {
            value[key] = JSON.parse(JSON.stringify(value[key]));
          }
          should.exist(value[key], type+" "+name+" "+key+" should exist");
          value[key].should.eql(expected[key], type+" "+name+" "+key+" should be "+expected[key]);
        }        
      }
    }
  }
  
}

/**
 * @description test array of values that results exist
 * @param {Array} results expected values to be found in values array
 * @param {String} type type of test that is being run
 * @param {String} name name of test that is being run
 * @param {Array} values array of objects to search for results in 
 */
function testArray(expected, type, name, values) {
  Array.isArray(values).should.eql(true);
  expected.length.should.be.eql(expected.length);
  for(var i = 0; i < expected.length; i++) {
    should.exist(values, type+" "+name+" should exist");
    if(typeof(expected[i]) === 'string') {
      values[i].should.eql(expected[i], type+" "+name+" "+i+" should be "+expected[i]);
    } else {
      testResults(expected[i], type, name, values[i]);
    }
  }  
}

// /**
//  * @description find an object in search array that has a key `key` with value `value`
//  * @param {String} key  key to find in search array of objects
//  * @param {String} value  value that search[n][key] should have
//  * @param {Array} search array of objecst to search
//  */
// function findMatch(key, value, search) {
//   for(var i = 0; i < search.length; i++) {
//     if(search[i][key] === value) {
//       return search[i];
//     }
//   }
// }
//
