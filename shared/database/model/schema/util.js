const semver = require("semver");
const util = require('dsp_lib/cmd_utils');
/* eslint-disable */
util.connect(['schema']);
const Schema = require('dsp_database/model/schema');
/* eslint-enable */

function *getLatestSchema(name) {
  const schema = yield Schema.find({ _name: name }).sort({ version: -1 }).limit(1);
  if (schema.length === 0) {
    console.error(`NO Schema Found: ${name}`);
  }
  return schema[0];
}

function *create(name, version, api) {
  const v = version || '0.0.1';
  return yield Schema.create({ _name: name, _version: v, _api: api });
}


function *add_field(name, field, type) {
  console.log("type", type, Schema.getTypes()[type]);
  const schema = yield getLatestSchema(name);
  if (schema) {
    schema.set(field, type);
    console.log("SCHEMA", schema, field, type);
    yield schema.save();
  }
  return schema;
}

function *drop_field(name, field) {
  const schema = yield getLatestSchema(name);
  if (schema) {
    schema.set(field, undefined);
    return yield schema.save();
  }
  return null;
}


function *bump(name, release) {
  const schema = yield getLatestSchema(name);
  if (schema) {
    const version = semver.inc(schema._version, release);
    schema._version = version;
    yield schema.save();
  }
  return schema;
}

if (require.main === module) {
  util.bakerGen(create);
  util.bakerGen(add_field);
  util.bakerGen(drop_field);
  util.bakerGen(bump);
  util.bakerRun();
}

module.exports = {
  getLatestSchema: getLatestSchema,
  create: create,
  add_field: add_field,
  drop_field: drop_field,
  bump: bump,
};
