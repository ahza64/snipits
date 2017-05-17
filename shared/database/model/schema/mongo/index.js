/**
 * This Model is a meta schema model to describe schemas in MongoDB
 *
 * * Creating a super simple schema defintiions supporting a few basic types.
 * * Store them in database and use them to
 * * Use stored schemas to create mongoose (and eventaully Sequelize models off of);
 *
 * ### Required Fields
 *  * _name: Name of table/collection/resource
 *  * _verison: SemVer string
 * ### Reserved Fields
 *  * _id (Used for mongo ids)
 *  * id  (Used for auto incremental db ids)
 *  * created - date entry was created in db
 *  * updated - date entry was last updated in db
 */

const co = require('co');
const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const _ = require('lodash');
const assert = require('assert');
const log = require('dsp_config/config').get().getLogger(`[${__filename}]`);
const initDB = require('dsp_database/database');
const getConnection = require('dsp_database/connections');
const Resource = require('./resource');

const types = {
  String: String,
  Number: Number,
  Date: Date,
  Boolean: Boolean,
  GeoJSON: Object,
  ForeignKey: mongoose.Schema.Types.ObjectId
};

class MongoSchema {
  /**
   * @description Schema implementation for MongoDB
   * @param {String} name storage name
   * @param {Object} config connection configuration
   * @param {String} config.name connection name
   * @param {String} config.mongo_db_host host name ("localhost", "127.0.0.1" etc.)
   * @param {Number} config.mongo_db_port host port (27017)
   * @param {String} config.mongo_db_name database name
   */
  constructor(name, config) {
    const self = this;
    this.name = name;
    // create the connection
    initDB(config);
    this.connection = getConnection(config.name);

    autoIncrement.initialize(this.connection);
    const s = {
      _name: { type: String, required: true, index: true }, // name of the model/collection
      _version: { type: String, required: true, index: true },
      id: { type: Number, index: true },
      created: Date,
      updated: Date,
      _api: String,
      _storage: String,
      _config: Object,
      //other_field: {enum: ["String", "Number", "Date", "Boolean", "ForeignKey"]}
    };
    const reserved_keys = Object.keys(s).concat(["_id", "__v", "_api"]);

    const schemaSchema = new mongoose.Schema(s, { strict: false });
    schemaSchema.plugin(autoIncrement.plugin, { model: 'Schema', field: 'id', startAt: 1 });
    schemaSchema.statics.getTypes = function getTypes() {
      return types;
    };

    // treeSchema.index({ location: '2dsphere' });
    schemaSchema.methods.getModel = function getModel() {
      try {
        return self.connection.model(this._name);
      } catch (e) {
        const schema = _.omit(this.toJSON(), reserved_keys);
        const fields = Object.keys(schema);
        const mongoSchema = self.getMongoSchema.bind(this)(fields);
        const builtSchema = new mongoose.Schema(mongoSchema);
        builtSchema.plugin(autoIncrement.plugin, { model: this._name, field: 'id', startAt: 1 });
        return self.connection.model(this._name, builtSchema);
      }
    };
    try {
      this.schemaModel = this.connection.model('Schema', schemaSchema);
    } catch (e) {
      this.schemaModel = this.connection.model('Schema');
    }
  }

  getMongoSchema(fields) {
    const baseSchema = {
      id: { type: Number, index: { unique: true } },
      created: { type: Date, default: Date.now, index: true },
      updated: { type: Date, default: Date.now, index: true },
      _deleted: { type: Boolean, default: false },
    };

    const self = this;

    const mongoSchema = {};
    fields.forEach((field) => {
      // parse schema document
      const type = self.get(field).type || self.get(field);
      const indexed = self.get(field).index || false;
      const unique = self.get(field).unique || false;
      assert(types[type], `Unknown Type: ${type} for ${field} in schema: ${self._name}`);

      // build mongoose schema for field
      const field_schema = { type: types[type] };
      if (unique) {
        field_schema.index = { unique: true };
      } else if (indexed) {
        field_schema.index = true;
        if (type === "GeoJSON") {
          field_schema.index = '2dsphere';
        }
      }
      mongoSchema[field] = field_schema;
    });
    // add standaridzed fields
    Object.assign(mongoSchema, baseSchema);
    return mongoSchema;
  }

  getModel(name, fields) {
    let model = null;
    try {
      model = this.connection.model(name);
    } catch (e) {
      const fieldsNames = Object.keys(fields);
      const schemaConf = {
        _name: name,
        get: (field) => {
          return fields[field];
        }
      };
      const mongoSchema = this.getMongoSchema.bind(schemaConf)(fieldsNames);
      const builtSchema = new mongoose.Schema(mongoSchema);
      builtSchema.plugin(autoIncrement.plugin, { model: name, field: 'id', startAt: 1 });
      model = this.connection.model(name, builtSchema);
    }
    return model;
  }

  /**
   * @description Get schemas list
   * @param {Object} params filter parameters
   * @return {Object[]}
   */
  find(params) {
    const self = this;
    return co(function *create_new_schema() {
      const schemas = yield self.schemaModel.find(params);
      return schemas.map(schema => schema.toJSON());
    });
  }

  /**
   * @description Get resource object
   * @param {String} name resource name
   * @param {Object} fields fields configuration
   * @param {String} storage storage name
   * @param {Object} config resource configuration
   * @return {Object} see {@link Resource}
   */
  getResource(name, fields, storage, config) {
    const self = this;
    let resource = null;
    if ((!storage) || (storage === self.name)) {
      const model = self.getModel(name, fields);
      resource = new Resource(model, name, config);
    } else {
      log.error(`Unable to get resource ${name}. Incorrect storage name: ${storage}.`);
    }
    return Promise.resolve(resource);
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
    return co(function *create_new_schema() {
      const doc = Object.assign({
        _name: name,
        _version: version,
        _api: api,
        _storage: storage,
        _config: config
      }, fields);
      return yield self.schemaModel.create(doc);
    });
  }

  /**
   * @description close connection
   */
  close() {
    this.connection.close();
  }
}

module.exports = MongoSchema;
