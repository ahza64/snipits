/**
 * The meta schema model for mongodb, postgresql and elasticsearch
 */

const co = require('co');
const _ = require('underscore');
const log = require('dsp_config/config').get().getLogger(`[${__filename}]`);
const PostgresSchema = require('./postgres');
const EsSchema = require('./elasticsearch');
const MongoSchema = require('./mongo');

const SchmeaModels = {
  'postgres': PostgresSchema,
  'mongo': MongoSchema,
  'elasticsearch': EsSchema
};

function getFields(schema) {
  const excludedFields = ['_name', '_version', 'id', 'created', 'updated',
  '_api', '_storage', '_id', '__v', '_config'];
  return _.omit(schema, excludedFields);
}

function getSchema(config) {
  let defaultSchema = null;
  const storages = config.storages || {};
  const defaultStorage = config.defaultStorage;
  const schemas = {};

  if (defaultStorage in storages) {
    Object.keys(storages).forEach((name) => {
      const storage = storages[name];
      if (storage.type in SchmeaModels) {
        schemas[name] = new SchmeaModels[storage.type](name, storage);
      } else {
        log.error(`Incorrect storage type: ${storage.type}.`);
      }
    });

    if (schemas[defaultStorage]) {
      const find = schemas[defaultStorage].find.bind(schemas[defaultStorage]);
      schemas[defaultStorage].find = (params) => {
        return co(function *find_schemas() {
          const schemasList = yield find(params);
          return schemasList.map((schema) => {
            const result = Object.assign({}, schema);
            const storageName = result._storage || defaultStorage;
            const schemaName = result._name;
            const config = result._config;
            const fields = getFields(schema);
            result.getResource = () => {
              return co(function *get_resource() {
                return yield schemas[storageName].getResource(schemaName, fields, storageName, config);
              });
            };
            return result;
          });
        });
      };

      schemas[defaultStorage].closeConnections = () => {
        Object.keys(schemas).forEach((name) => {
          schemas[name].close();
        });
      };
      defaultSchema = schemas[defaultStorage];
    } else {
      log.error(`Default schema (${defaultStorage}) was not created.`);
    }
  } else {
    log.error(`Incorrect defaultStorage: ${defaultStorage}.`);
  }

  return defaultSchema;
}

module.exports = getSchema;
