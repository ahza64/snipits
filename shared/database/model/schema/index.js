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
 * ### Schema
 *  All other fields should be in the following format
 *  ```
      {
        stringField: "String",
        numberField: {type: "Number"}
        dateField: {type: "Date"},
        indexedString: {type: "String", index: true},
        uniqNumber: {type: "Number", unique: true},
        geoJSON: {type: "GeoJSON"}
        indexJSON: {type: "GeoJSON", index: true}
      }
 *  ```
 */

const mongoose = require('mongoose');
const connection = require('dsp_database/connections')('schema');
const autoIncrement = require('mongoose-auto-increment');
const _ = require('lodash');
const assert = require('assert');

let SchemaModel;

autoIncrement.initialize(connection);
const s = {
  _name: { type: String, required: true, index: true }, // name of the model/collection
  _version: { type: String, required: true, index: true },
  id: { type: Number, index: true },
  created: Date,
  updated: Date,
  //other_field: {enum: ["String", "Number", "Date", "Boolean", "ForeignKey"]}
};
const reserved_keys = Object.keys(s).concat(["_id", "__v", "_api"]);

// Damn so meta
const schemaSchema = new mongoose.Schema(s, { strict: false });
const types = {
  String: String,
  Number: Number,
  Date: Date,
  Boolean: Boolean,
  GeoJSON: { type: {} },
  ForeignKey: mongoose.Schema.Types.ObjectId
};

const baseSchema = {
  id: { type: Number, index: { unique: true } },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now, index: true }
};

schemaSchema.plugin(autoIncrement.plugin, { model: 'Schema', field: 'id', startAt: 1 });
schemaSchema.methods.getMongoSchema = function getMongoSchema() {
  const schema = _.omit(this.toJSON(), reserved_keys);
  const fields = Object.keys(schema);
  const self = this;

  const monogoSchema = {};
  fields.forEach((field) => {
    // parse schema document
    console.log("field", field, self[field]);
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
    monogoSchema[field] = field_schema;
  });
  // add standaridzed fields
  Object.assign(monogoSchema, baseSchema);
  console.log("FINAL SCHEMA", monogoSchema);
  return monogoSchema;
};

function addGetSchema(schema, schema_name) {
  schema.methods.getSchema = function getSchema() {
    return SchemaModel.findOne({ _name: schema_name });
  };
}

schemaSchema.statics.getTypes = function getTypes() {
  return types;
};

// treeSchema.index({ location: '2dsphere' });
schemaSchema.methods.getModel = function getModel() {
  try {
    return connection.model(this._name);
  } catch (e) {
    const builtSchema = new mongoose.Schema(this.getMongoSchema());
    builtSchema.plugin(autoIncrement.plugin, { model: this._name, field: 'id', startAt: 1 });
    addGetSchema(builtSchema, this._name);
    return connection.model(this._name, builtSchema);
  }
};


SchemaModel = connection.model('Schema', schemaSchema);


module.exports = SchemaModel;
