var BPromse = require("bluebird");
var assert = require('assert');
/**
 * {@code
 *     if (require.main === module) {
 *       co(function*() {
 *         var count = 0;
 *         var tree_stream = stream(Tree, {});
 *         for(var tree of tree_stream) {
 *           tree = yield tree;
 *           console.log("tree", tree._id, count);
 *           count++;
 *         }
 *       }).then(function(){
 *         console.log("DONE");
 *       });
 *     }
 * }
 */


/**
 * @description stream the documents in this model one doc at a time. This generator yields promises
 * that resolve to mongo documents
 *
 * @param {Object} Model The model object to run the query
 * @param {Object} query a mongo query
 */
function *stream(Model, query, sort) {
  // console.log("stream_gen", Model.name, query);
  assert(Model, "NO MODEL for stream");
  var done = false;
  var next = null;
  var error = null;
  var next_resolve = null;
  var next_reject = null;
  var cursor = Model.find(query);
  if(sort) {
    cursor = cursor.sort(sort);
  }
  var _stream = cursor.stream();
  _stream.on('data', function(doc){
    this.pause();
    if(next_resolve) {
      next_resolve(doc);
      next_resolve = null;
      next_reject = null;
      this.resume();
    } else {
      if(next) {
        throw Error("Handler handled next to fast");
      } else {
        next = doc;
      }
    }
  });

  _stream.on('error', function (err) {
    // handle err
    error = err;
    if(next_reject) {
      next_reject(err);
    }
  });

  _stream.on('close', function () {
    // all done
    cleanup();
  });
  _stream.on('end', function () {
    // all done
    cleanup();
  });

  function cleanup() {
    done = true;
    if(next_resolve) {
      next_resolve(null);
    }    
  }

  while(!done || next) {
    yield new BPromse(function(resolve, reject) {
      if(error) {
        reject(error);
      } else if(next) {
        resolve(next);
        next = null;
        _stream.resume();
      } else {
        if(next_resolve) {
          throw Error("Can not get next while still waiting for previous.");
        }
        next_resolve = resolve;
        next_reject = reject;
      }
    });
  }
}

module.exports = stream;
