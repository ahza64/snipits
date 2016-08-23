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
function co_iterator(handler) {
  var done = false;
  var error = null;
  var resume = null;
  var next = null;
  var next_resolve;
  var next_reject;
  var itr = _co_iterator();
  
  function handleNext(data) {
    // console.log("HANDLING NEXT", data);
    if(next_resolve) {
      next_resolve(data);
      next_resolve = null;
      next = null;
      return BPromise.resolve();
    } else {
      // console.log("PAUSED", data);
      if(resume) {
        throw Error("Handler handled next to fast");
      } else {
        next = data;
        return new BPromise(function(resolve){
          resume = resolve;
        });      
      }
    }
  }  

  co(function*(){
    yield handler(handleNext);
  }).then(function(){
    done = true;
    if(next_resolve) {
      next_resolve(null);
    }
    itr.next();    
  }).catch(function(err){
    console.error(err.message);
    error = err;
    done = true;
    if(next_resolve) {
      next_resolve(null);
    }
    itr.next();        
  });  
  
  function *_co_iterator() {
    while(!done || next) {
      // console.log("HANDLING", done, next);
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
    }
    if(resume) {
      resume();
      resume = null;
    }
    if(next_resolve) {
      next_resolve(null);
      next_resolve = null;
    }
  
  }
  return itr;  
}




module.exports = co_iterator;