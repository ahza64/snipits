/**
 * @fileOverview This script will generate fake data using api v4
 * Create a schema
 */

const faker = require('faker');
const apiV4util = require('dsp_shared/database/model/schema/util');
const util = require('dsp_shared/lib/cmd_utils');
util.connect(['schema']);

// names
const schema_model = {
  company: 'String',
  name: 'String',
  type: 'String',
  count: 'Number',
  time: 'Date',
  price: 'Number',
  location: 'GeoJSON',
};

function *create_schema(schema_name) {
  console.log(`Calling create_schema for ${schema_name}`);
  // Create schema
  yield apiV4util.create(schema_name, '0.0.1', 'v4');
  for (let i = 0; i < Object.keys(schema_model).length; i++) {
    let key = Object.keys(schema_model)[i];
    yield apiV4util.add_field(schema_name, key, schema_model[key]);
  }
}

if (require.main === module) {
  util.bakerGen(create_schema);
  util.bakerRun();
}
