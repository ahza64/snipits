import * as httpRequest from 'superagent';

let listeners = [];

let middleware = function(req) {
  var callback = req.callback;
  req.callback = function(err, res) {
    listeners.forEach(function(listener) {
      try {
        listener.call(req, err, res);
      } catch (e) {
        // Ignore errors
      }
    });
    callback.call(req, err, res);
  };
};

let addListener = function(listener) {
  listeners.push(listener);
};

let get = function(url) {
  return httpRequest.get(url).use(middleware);
};

let post = function(url) {
  return httpRequest.post(url).use(middleware);
};

let put = function(url) {
  return httpRequest.put(url).use(middleware);
};

let deleteMethod = function(url) {
  return httpRequest.delete(url).use(middleware);
};

module.exports = {
  'get': get,
  'post': post,
  'put': put,
  'delete': deleteMethod,
  'addListener': addListener
};