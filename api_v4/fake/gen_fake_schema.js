/**
 * @fileOverview This script will generate fake data using api v4
 * 1. Create a schema
 * 2. Create multiple documents in that schema
 */

const co = require('co');
const faker = require('faker');
const rp = require('request-promise');
const config = require('dsp_shared/config/config').get();
const apiV4util = require('dsp_shared/database/model/schema/util');

// names
const schema_name = faker.internet.domainWord();
const schema_model = {
  company: 'String',
  name: 'String',
  type: 'String',
  count: 'Number',
  time: 'Date',
  price: 'Number',
  location: 'GeoJSON',
};

co(function *fake_data_gen() {
  // Create schema
  yield apiV4util.create('tests', '0.0.1', 'v4');
  // yield apiV4util.create(schema_name, '0.0.1', 'v4');
  for (let i = 0; i < Object.keys(schema_model).length; i++) {
    let key = Object.keys(schema_model)[i];
    yield apiV4util.add_field('tests', key, schema_model[key]);
    // yield apiV4util.add_field(schema_name, key, schema_model[key]);
  }
}).catch((e) => {
  console.error(`error while generating fake data for api v4: ${e}`);
});