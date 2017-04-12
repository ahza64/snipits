/**
 * The meta schema model of PostgreSQL
 */

const path = require('path');
const co = require('co');
const createConnection = require('dsp_database/sequelize')
const Sequelize = require('sequelize');
const _ = require('underscore');
const PostgresResource = require('./resource');

class PostgresSchema {
  constructor(config) {
    const db = {};
    db.sequelize = new Sequelize(
      `postgres://${config.db_user}:${config.db_pass}@${config.db_host}:${config.db_port}/${config.db_name}`,
      {
        define: {
          freezeTableName: true
        }
      }
    );
    db.Sequelize = Sequelize;
    db.schemas = db.sequelize.import('schemas', function(sequelize, DataTypes) {
      return sequelize.define('schemas', {
        _id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        _name: { type: DataTypes.STRING },
        _version: { type: DataTypes.STRING },
        _api: { type: DataTypes.STRING },
        __v: { type: DataTypes.INTEGER },
        fields: { type: DataTypes.JSON }
      });
    });

    Object.keys(db).forEach(function(modelName) {
      if ('associate' in db[modelName]) {
        db[modelName].associate(db);
      }
    });

    this.db = db;
  }

  getType() {
    return 'postgres';
  }

  create(name, version, api, fields) {
    const self = this;
    const newSchema = {
      _name: name,
      _version: version,
      _api: api,
      __v: 0,
      fields: fields
    };

    return co(function *create_new_schema() {
      return yield self.db.schemas.create(newSchema);
    });
  }

  prepareSchema(schema) {
    let prepared =_.omit(schema, ['createdAt', 'updatedAt', 'fields']);
    prepared = Object.assign(prepared, { id: schema._id, _id: `${schema._id}` }, schema.fields);
    prepared.getResource = () => {
      return this.getResource(schema, schema.fields);
    };
    return prepared;
  }

  getResource(schema, fields) {
    this.db[schema._name] = this.db.sequelize.import(schema._name, function(sequelize, DataTypes) {
      const tableSchema = {
        _id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        _deleted: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
      };
      Object.keys(fields).forEach((field) => {
        const fieldType = fields[field].toLowerCase();
        const allowedTypes = {
          "string": DataTypes.STRING,
          "number": DataTypes.DOUBLE,
          "date": DataTypes.DATE,
          "geojson": DataTypes.JSON
        };
        if (fieldType in allowedTypes) {
          tableSchema[field] = { type: allowedTypes[fieldType] }
        } else {
          console.error(`Init table ${schema._name} error: field type ${fieldType} is not allowed.`);
        }
      });
      return sequelize.define(schema._name, tableSchema);
    });

    this.db[schema._name].sync();

    return new PostgresResource(schema._name, this.db[schema._name]);
  }

  find() {
    const self = this;
    return co(function *find_schemas() {
      yield self.db.schemas.sync();
      return yield self.db.schemas.findAll({ raw: true }).map(schema => self.prepareSchema(schema));
    });
  }
}

module.exports = PostgresSchema;
