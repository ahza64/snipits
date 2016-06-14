var should = require("should");

function testResults(results, type, name, value){

  for(var key in results) {
    if(results.hasOwnProperty(key)) {
      if(results[key] === null) {
        (value[key] === null).should.be.eql(true, type+" "+name+" "+key+" should be null");
      } else {
        should.exist(value[key], type+" "+name+" "+key+" should exist");
        value[key].should.eql(results[key], type+" "+name+" "+key+" should be "+results[key]);
      }
    }
  }
  
}

module.exports = {
  testResults: testResults
};