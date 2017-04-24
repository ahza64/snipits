/**
 * The meta schema model for mongodb, postgresql and elasticsearch
 */

const _ = require('underscore');
const config = require('dsp_config/config').get().schema || {};
const storages = config.storages || {};
const defaultStorage = config.defaultStorage;

const PostgresSchema = require('./postgres');
const EsSchema = require('./elasticsearch');
const MongoSchema = require('./mongo');

const schemas = {};
const getResource = {};

function getFields(schema) {
  const excludedFields = ['_name', '_version', 'id', 'created', 'updated',
  '_api', '_storage', '_id', '__v'];
  return _.omit(schema, excludedFields);
}

Object.keys(storages).forEach((name) => {
  const storage = storages[name];

  if (storage.type === 'postgres') {
    schemas[name] = new PostgresSchema(name, storage);
  } else if (storage.type === 'elasticsearch') {
    schemas[name] = new EsSchema(name, storage);
  } else {
    schemas[name] = new MongoSchema(name, storage);
  }
  if (schemas[name] && schemas[name].getResource) {
    getResource[name] = schemas[name].getResource.bind(schemas[name])
  }
});

if (schemas[defaultStorage]) {
  schemas[defaultStorage].getResource = (schema) => {
    const storageName = schema._storage || defaultStorage;
    const schemaName = schema._name;
    const fields = getFields(schema);
    return getResource[storageName](schemaName, fields, storageName);
  };
  schemas[defaultStorage].closeConnections = () => {
    Object.keys(schemas).forEach((name) => {
      schemas[name].close();
    });
  };
}

module.exports = schemas[defaultStorage];
