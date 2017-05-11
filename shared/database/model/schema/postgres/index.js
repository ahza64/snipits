/**
 * The meta schema model of PostgreSQL
 */

const path = require('path');
const co = require('co');
const Sequelize = require('sequelize');
const _ = require('underscore');
const log = require('dsp_config/config').get().getLogger(`[${__filename}]`);
const PostgresResource = require('./resource');

class PostgresSchema {
  /**
   * @description Schema implementation for PostgreSQL
   * @param {String} name name of storage connection
   * @param {Object} config connection configuration
   * @param {String} config.db_host host name ("localhost", "127.0.0.1" etc.)
   * @param {Number} config.db_port host port
   * @param {String} config.db_name database name
   * @param {String} config.db_user user name
   * @param {String} config.db_pass user password
   */
  constructor(name, config) {
    this.name = name;
    const db = {};
    db.sequelize = new Sequelize(
      `postgres://${config.db_user}:${config.db_pass}@${config.db_host}:${config.db_port}/${config.db_name}`,
      {
        define: {
          freezeTableName: true
        },
        pool: {
          max: 5,
          min: 0,
          idle: 1000
        },
        logging: config.logging
      }
    );
    db.Sequelize = Sequelize;
    db.schemas = db.sequelize.import('schemas', function(sequelize, DataTypes) {
      return sequelize.define('schemas', {
        _id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        _name: { type: DataTypes.STRING },
        _version: { type: DataTypes.STRING },
        _api: { type: DataTypes.STRING },
        _storage: { type: DataTypes.STRING },
        _config: { type: DataTypes.JSON },
        __v: { type: DataTypes.INTEGER },
        fields: { type: DataTypes.JSON }
      });
    });

    Object.keys(db).forEach(function(modelName) {
      if ('associate' in db[modelName]) {
        db[modelName].associate(db);
      }
    });
    db.schemas.sync().then(() => {});
    this.db = db;
    this.synchronized = false;
  }

  /**
   * @description Get storage type name
   * @return {String}
   */
  getType() {
    return 'postgres';
  }

  /**
   * @description Create "schemas" table if it does not exist
   */
  sync() {
    const self = this;
    return co(function *create_new_schema() {
      if (!self.synchronized) {
        yield self.db.schemas.sync();
        self.synchronized = true;
      }
    });
  }

  /**
   * @description Create new schema
   * @param {String} name schema's name
   * @param {String} version schema's version
   * @param {String} api api's version
   * @param {Object} fields schema's fields configuration
   * @param {String} fields[].type field type: "String", "Number", "Date", "GeoJSON"
   * @param {Boolean} fields[].required field is required
   * @param {Boolean} fields[].editable field value can be edited
   * @param {Boolean} fields[].visible field value is visible by default
   * @param {String} storage storage name
   * @param {Object} config resource configuration
   * @param {Object} config.filters filter resource data by user data: { <resource_field_name>: <user_field_name> }
   */
  create(name, version, api, fields, storage, config) {
    const self = this;
    const newSchema = {
      _name: name,
      _version: version,
      _api: api,
      _storage: storage,
      _config: config,
      __v: 0,
      fields: fields,
    };

    return co(function *create_new_schema() {
      yield self.sync();
      const createdItem = yield self.db.schemas.create(newSchema);
      return createdItem.dataValues;
    });
  }

  prepareSchema(schema) {
    let prepared =_.omit(schema, ['createdAt', 'updatedAt', 'fields']);
    prepared = Object.assign(prepared, { id: schema._id, _id: `${schema._id}` }, schema.fields);
    return prepared;
  }

  /**
   * @description Get resource object
   * @param {String} name resource name
   * @param {Object} fields fields configuration
   * @param {String} storage storage name
   * @param {Object} config resource configuration
   * @return {Object} see {@link PostgresResource}
   */
  getResource(name, fields, storage, config) {
    if ((!storage) || (storage === this.name)) {
      this.db[name] = this.db.sequelize.import(name, function(sequelize, DataTypes) {
        const tableSchema = {
          _id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
          _deleted: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
        };
        Object.keys(fields).forEach((field) => {
          let fieldType = fields[field];
          if (typeof fieldType === 'object') {
            fieldType = fieldType.type;
          }
          if (typeof fieldType === 'string') {
            fieldType = fieldType.toLowerCase();
          }
          const allowedTypes = {
            "string": DataTypes.STRING,
            "number": DataTypes.DOUBLE,
            "date": DataTypes.DATE,
            "geojson": DataTypes.JSON
          };
          if (fieldType in allowedTypes) {
            tableSchema[field] = { type: allowedTypes[fieldType] }
          } else {
            log.error(`Init table ${name} error: field ${field} type ${fieldType} is not allowed.`);
          }
        });
        return sequelize.define(name, tableSchema);
      });
    } else {
      log.error(`Unable to get resource ${name}. Incorrect storage name: ${storage}.`);
    }

    const self = this;
    return co(function *get_resource() {
      let res = null;
      if (self.db[name]) {
        yield self.db[name].sync();
        res = new PostgresResource(name, self.db[name], config);
      }
      return res;
    });
  }

  /**
   * @description Get schemas list
   * @param {Object} params filter parameters
   * @return {Object[]}
   */
  find(params) {
    const self = this;
    return co(function *find_schemas() {
      yield self.sync();
      const filters = PostgresResource.prepareFilters(params);
      return yield self.db.schemas.findAll({ where: filters, raw: true }).map(schema => self.prepareSchema(schema));
    });
  }

  /**
   * @description close connection
   */
  close() {
    this.db.sequelize.close();
  }
}

module.exports = PostgresSchema;
