var fs = require("fs");
var BPromise = require("bluebird");
var parse = require('csv-parse');

function *streamCSV(file_path) {
  console.log("streamCSV", file_path);
  var parser = parse({columns: true});      
  var input = fs.createReadStream(file_path);
  input.pipe(parser);  
  
  
  var done = false;
  var next = null;
  var error = null;
  var next_resolve = null;
  var next_reject = null;

  parser.on('data', function(doc){  
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
          
  parser.on('error', function (err) {
    // handle err
    error = err;
    if(next_reject) {
      next_reject(err);
    }
  });

  parser.on('close', function () {
    // all done
    done = true;
  });

  parser.on('end', function () {
    // all done
    done = true;
  });

  
  while(!done || next) {
    yield new BPromise(function(resolve, reject) {      
      if(error) {
        reject(error);
      } else if(next) {
        resolve(next);
        next = null;
        parser.resume();
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

module.exports = streamCSV;