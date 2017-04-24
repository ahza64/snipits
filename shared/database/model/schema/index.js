/**
 * The meta schema model for mongodb, postgresql and elasticsearch
 */

const config = require('dsp_config/config').get().schema || {};
const storages = config.storages || {};
const defaultStorage = config.defaultStorage;

const PostgresSchema = require('./postgres');
const EsSchema = require('./elasticsearch');
const MongoSchema = require('./mongo');

const schemas = {};
const getResource = {};

Object.keys(storages).forEach((name) => {
  const storage = storages[name];

  if (storage.type === 'postgres') {
    schemas[name] = new PostgresSchema(name, storage);
  } else if (storage.type === 'elasticsearch') {
    schemas[name] = new EsSchema(storage);
  } else {
    //schemas[name] = require('./mongo');
    schemas[name] = new MongoSchema(name, storage);
  }
  if (schemas[name] && schemas[name].getResource) {
    getResource[name] = schemas[name].getResource.bind(schemas[name])
  }
});

if (schemas[defaultStorage]) {
  schemas[defaultStorage].getResource = (schema, fields) => {
    const storageName = schema._storage || defaultStorage;
    return getResource[storageName](schema, fields);
  };
}

module.exports = schemas[defaultStorage];
