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

  getType() {
    return 'postgres';
  }

  sync() {
    const self = this;
    return co(function *create_new_schema() {
      if (!self.synchronized) {
        yield self.db.schemas.sync();
        self.synchronized = true;
      }
    });
  }

  create(name, version, api, fields, storage) {
    const self = this;
    const newSchema = {
      _name: name,
      _version: version,
      _api: api,
      _storage: storage,
      __v: 0,
      fields: fields
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

  getResource(name, fields, storage) {
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
            log.error(`Init table ${name} error: field type ${fieldType} is not allowed.`);
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
        res = new PostgresResource(name, self.db[name]);
      }
      return res;
    });
  }

  find(params) {
    const self = this;
    return co(function *find_schemas() {
      yield self.sync();
      const filters = PostgresResource.prepareFilters(params);
      return yield self.db.schemas.findAll({ where: filters, raw: true }).map(schema => self.prepareSchema(schema));
    });
  }

  close() {
    this.db.sequelize.close();
  }
}

module.exports = PostgresSchema;
