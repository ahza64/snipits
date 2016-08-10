/**
 * @fileoverview This allows you to pass a co generator function and iterate through with a built asycnronous wait
 */
var co = require('co');
var BPromise = require('bluebird');

/**
 * @description generator that takes a handler function
 * @pass handler function 
 * 
 * handler is passed a handleNext function that should be called with each value to be iterated.
 * handleNext returns a Promise and should not be called again until the previous promise is resolved.
 */
function *co_iterator(handler) {
  var done = false;
  var error = null;
  var resume = null;
  var next = null;
  var next_resolve;
  var next_reject;
  
  
  function handleNext(data) {
    next = data;
    if(next_resolve) {
      next_resolve(next);
      next_resolve = null;
      next = null;
      return BPromise.resolve();
    } else {
      if(resume) {
        throw Error("Handler handled next to fast");
      } else {
        return new BPromise(function(resolve){
          resume = resolve;
        });      
      }
    }
  }  
  
  
  co(function*(){
    yield handler(handleNext);
  }).then(function(){
    console.log("GEN DONE HERE");
    done = true;
  }).catch(function(err){
    console.error(err);
    error = err;
    done = true;
  });  
  
  
  while(!done || !next) {
    console.log("GOT NEXT", done, next)
    yield new BPromise(function(resolve, reject) {      
      if(error) {
        reject(error);
      } else if(next) {
        resolve(next);
        next = null;
        resume();
        resume = null;
      } else {
        if(next_resolve) {
          throw Error("Can not get next while still waiting for previous.");
        }
        next_resolve = resolve;
        next_reject = reject;
      }
    });
    console.log("CONTINUE LOOP")
  }
}

module.exports = co_iterator;