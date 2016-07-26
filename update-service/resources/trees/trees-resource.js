'use strict';

const TreeModel = require('dsp_shared/database/model/tree');
const TreeResource = {};

const utils = require('../../utils');
const AppErr = require('../../error');

TreeResource.fetch = function(condition, options) {
	return TreeModel.find(condition)
    .catch(err => AppErr.formatMongoErrors(err, this.RESOURCE))
    .then(result => result || AppErr.reject(null, this.ERROR.NOT_FOUND))
    .catch(err => AppErr.reject(err, this.ERROR.FETCH));
};

TreeResource.update = function(condition, update, options) {
  return TreeModel.update(condition, update, options)
		.catch(err => AppErr.formatMongoErrors(err, this.RESOURCE))
		.then(result => result || AppErr.reject(null, this.ERROR.NOT_FOUND))
		.catch(err => AppErr.reject(err, this.ERROR.UPDATE));
};

module.exports = TreeResource;
