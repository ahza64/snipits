'use strict';

var utils = {};
const _ = require('underscore');

/**
 *
 */
utils.toJSON = function(object, excluded_keys) {
  var json = JSON.parse(JSON.stringify(object));
  if(excluded_keys) {
    _.each(excluded_keys, (key) => delete json[key]);
  }
  return json;
};

module.exports = utils;
