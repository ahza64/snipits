/**
 * @fileoverview This allows you to pass a co generator function and iterate through with a built asycnronous wait
 */
var co = require('co');
var BPromise = require('bluebird');

/**
 * @description generator that takes a handler function
 * @pass handler function 
 * 
 * producer is passed a produce function that should be called with each value to be iterated.
 * handleNext returns a Promise and should not be called again until the previous promise is resolved.
 */
function co_iterator(producer) {
  var producer_done = false;
  var error = null;
  var consumed = null;
  var next_data = null;
  var waiting = false;
  var next_resolve = null;
  var next_reject = null;
  var itr = _co_iterator();
  
  /*
  * Start Producer 
  */
  co(function*(){
    // console.log("STARTING Producer");
    yield producer(produce);
    // console.log("FINISHED ITERATOR");
    cleanup();
  }).catch(function(err){
    error = err;
    cleanup();
  });  
  
  function produce(data) {
    //return promise that resolves when consumed
    // console.log("Data Produced");
    if(waiting) {
      return feedWaitingConsumer(data);
    } else {
      return queueNext(data);
    }
  }  
  
  
  function queueNext(data) {
    // console.log("queueNext");
    if(next_data) {
      throw Error("Produced data to fast");
    } else {
      next_data = data;
      return new BPromise(function(resolve){
        consumed = resolve;
      });      
    }    
  }
  
  function feedWaitingConsumer(data) {
    // console.log("feedWaitingConsumer", data);
    next_resolve(data);
    next_resolve = null;
    next_reject = null;
    waiting = false;
    next_data = null;
    return BPromise.resolve(); //consumed
  }
  
  function consumeNext() {
    // console.log("consumeNext");
    var p = BPromise.resolve(next_data);
    next_data = null;
    consumed();
    consumed = null;        
    return p;
  }
  
  function waitForProduction() {
    // console.log("waitForProduction");
    return new BPromise(function(resolve, reject) {
      if(waiting) {
        reject(Error("Consumed data to fast."));
      }
      waiting = true;
      next_resolve = resolve;
      next_reject = reject;
    });
  }
  
  function cleanup() {
    producer_done = true;
    if(waiting) {
      //generator is waiting for promise
      if(error) {
        next_reject(error);
        error = null;
      } else {
        next_resolve(null);
      }      
      next_resolve = null;
      next_reject = null;
      waiting = false;
    }
    // console.log("CLEAN UP NEXT");
    itr.next();
  }
  
  function *_co_iterator() {
    while(!producer_done || next_data || error) {
      // console.log("Looping Generator", producer_done, next_data, error);
      if(error) {
        yield BPromise.reject(error);
        error = null;
      }
      if(next_data) {
        yield consumeNext();
      } else {
        yield waitForProduction();
      }
    }

    if(waiting) {      
      next_resolve(null);
      next_resolve = null;
      waiting = false;
    }  
  }
  
  return itr;  
}




module.exports = co_iterator;