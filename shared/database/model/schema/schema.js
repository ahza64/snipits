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
  postgres: PostgresSchema,
  mongo: MongoSchema,
  elasticsearch: EsSchema
};

function getFields(schema) {
  const excludedFields = ['_name', '_version', 'id', 'created', 'updated',
    '_api', '_storage', '_id', '__v', '_config'];
  return _.omit(schema, excludedFields);
}

/**
 * @description Create Schema object that provides unified access to different storages
 * (mongodb, postgresql and elasticsearch)
 * @example
 * const Schema = getSchema(config); // see /shared/config/config_template.json
 * const schemas = Schema.find({}); // get list of all schemas
 * schemas.forEach((schema) => {
 *   const resource = schema.getResource(); // see {storage_name}/resource.js docs
 * });
 * Schema.closeConnections(); // close all connections when Schema object is not needed anymore
 * @param {Object} config schema configuration
 * @param {Object} config.storages list of all storage (connections configurations)
 * @param {String} config.defaultStorage name of default storage that contains links to all resources
 * @return {Object}
 */
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
            /* eslint-disable no-underscore-dangle */
            const storageName = result._storage || defaultStorage;
            const schemaName = result._name;
            const schemaConfig = result._config;
            /* eslint-enable no-underscore-dangle */
            const fields = getFields(schema);
            result.getResource = () => {
              return co(function *get_resource() {
                return yield schemas[storageName].getResource(schemaName, fields, storageName, schemaConfig);
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
