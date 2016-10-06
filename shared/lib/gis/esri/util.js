var log = require('dsp_config/config').get().getLogger('['+__filename+']');
var rest = require('restler');

function req_thunk(url, options) {
    return function(cb) {
        // console.log("MAKING ESRI REQUEST");
        rest.get(url, options).
        on('complete', function(data, response){
            cb(null, [data, response]);
        });
    };
}

function post_thunk(url, options, data) {
    return function(cb) {
        // console.log("MAKING ESRI POST REQUEST");
        options.data = data;
        rest.post(url, options).
                      on('complete', function(data, response){
                        cb(null, [data, response]);
                      });
    };
}

function *http_get(url, params) {
  var response = yield req_thunk(url, { query: params,
                                    headers: {
                                      "Content-type": "application/json",
                                      "Accept": "application/json"            
                                    },
                                    followRedirects: true
                                  });
  //TODO - better error handling
  // console.log("GET HTTP", response);
  // var response = data[1];                                  
  
  var data = response[0];
  try { 
    data = JSON.parse(data);
  } catch(e) {
    log.error("BAD RESPONSE", data);  
    log.error("BAD RESPONSE", response);  
    return null;
  }
  return data;
}

function *http_post(url, params, data) {
  //NOTE - untested
  var response = yield post_thunk(url,{ query: params,
                                    headers: {
                                      "Content-type": "application/json",
                                      "Accept": "application/json"            
                                    },
                                    followRedirects: true
                                  }, data);
  // console.log("REQUEST", JSON.stringify(data,undefined, 4));
  // console.log("REQUEST", response[1].req._headers);
  // console.log("REQUEST RESPONSE", response);
  // console.log("REQUEST RESPONSE", response[0]);
  data = response[0];
  try { 
    data = JSON.parse(data);
  } catch(e) {
    log.error("BAD RESPONSE", data);  
    log.error("BAD RESPONSE", response);  
    return null;
  }
  return data;
}

module.exports = {http_post: http_post, http_get: http_get};