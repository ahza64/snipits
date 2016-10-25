/* globals describe, it, before, after */

// Module
var BPromise = require("bluebird");
var co = require("co");
var co_iterator = require("../co_iterator");
require('should');

describe('CO Iterator', function() {  
  before(function(done) {
    done();
  });

  after(function(done) {
        done();
  });

  it('should allow you to create a simple stream', function() {

    var stream = co_iterator(function*(produce){
      yield produce(1);
      yield produce(2);
      yield produce(3);                
    });      


    return co(function*(){
      var expect = 0;
      for(var p of stream){
        var i = yield p;
        if(i !== null) { 
          expect++;        
          i.should.be.eql(expect);
        }
      }
    });
  });
  
  it('test js promise', function(){
    return co(function*(){
      var caught_error = false;
      try {
        yield Promise.reject(new Error("TEST"));
      } catch(e) {
        console.log("CAUGHT ERROR", e);
        caught_error = true;
      }
      caught_error.should.be.eql(true);
    });
  });

  it('test bb promise', function(){
    return co(function*(){
      var caught_error = false;
      try {
        yield BPromise.reject(new Error("TEST2"));
      } catch(e) {
        console.log("CAUGHT ERROR", e);
        caught_error = true;
      }
      caught_error.should.be.eql(true);
    });
  });
  
  
  it('test for of loop with promise', function(){
    
    function *gen() {
      yield Promise.reject(new Error("TEST3"));
    }
    
    return co(function*(){
      var caught_error = false;
      for(var p of gen()){
        try {
          yield p;
        } catch(e) {
          console.log("CAUGHT ERROR", e);
          caught_error = true;
        }
        caught_error.should.be.eql(true);
      }
    });
  });
  
  
  it('should let you know when there are errors', function() {

    var stream = co_iterator(function*(produce){
      yield produce(1);
      throw new Error("SOMETHING HAPPEND");
    });


    return co(function*(){
      var expect = 0;
      try {
        for(var p of stream){
          expect++;
          console.log("looking for more");
          var i = yield p;
          if(i !== null) {
            i.should.be.eql(expect);
          }
        }
      } catch(error) {
        error.message.should.eql("SOMETHING HAPPEND");
        expect.should.be.eql(2);
      }
    });
  });
  
  


});