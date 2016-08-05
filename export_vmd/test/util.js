var should = require("should");

function testResults(results, type, name, value){
  for(var key in results) {
    if(results.hasOwnProperty(key)) {
      if(results[key] === null) {
        (value[key] === null).should.be.eql(true, type+" "+name+" "+key+" should be null");
      } else {
        if(Array.isArray(results[key])) {
          testArray(results[key], type, name+" "+key, value[key]);
        } else {
          should.exist(value[key], type+" "+name+" "+key+" should exist");
          value[key].should.eql(results[key], type+" "+name+" "+key+" should be "+results[key]);
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
function testArray(results, type, name, values) {
  for(var i = 0; i < results.length; i++) {
    should.exist(values, type+" "+name+" should exist");
    var match = null;
    for(var key in results[i]){
      if(results[i].hasOwnProperty(key)) {
        match = findMatch(key, values[i][key], values);
        should.exist(match, type+" "+name+" should have object with "+key);
        break;//frist key only
      }
    }
    testResults(results[i], type, name, match);
  }  
}

/**
 * @description find an object in search array that has a key `key` with value `value`
 * @param {String} key  key to find in search array of objects
 * @param {String} value  value that search[n][key] should have
 * @param {Array} search array of objecst to search
 */
function findMatch(key, value, search) {
  for(var i = 0; i < search.length; i++) {
    if(search[i][key] === value) {
      return search[i];
    }
  }
}


module.exports = {
  testResults: testResults
};