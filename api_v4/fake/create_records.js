/**
 * @fileOverview This script will generate fake data using api v4
 * Create multiple documents in that schema
 */

const faker = require('faker');
const rp = require('request-promise');
const config = require('dsp_shared/config/config').get();
const util = require('dsp_shared/lib/cmd_utils');
util.connect([]);

function *create_records(schema_name, count) {
  console.log(`Calling create_records for ${schema_name} generating ${count} ${typeof count} records`);
  // Create records
  let option = {
    method: 'POST',
    uri: `http://${config.api_host}:${config.api_port}/api/v4/${schema_name}`,
    body: {},
    json: true
  };

  for (let i = 0; i < count; i++) {
    let body = {
      company: faker.company.companyName(),
      name: faker.commerce.product(),
      type: faker.commerce.productMaterial(),
      count: faker.random.number(),
      time: new Date(faker.date.recent()),
      price: parseInt(faker.commerce.price()),
      location: {
        type : 'Point',
        coordinates : [ 
          parseInt(faker.address.longitude()),
          parseInt(faker.address.latitude())
        ]
      }
    };
    option.body = body;

    try {
      console.log(option);
      yield rp(option);
    } catch(e) {
      console.error(`error when creating records in the database: ${e}`);
    }
  }
}

if (require.main === module) {
  util.bakerGen(create_records);
  util.bakerRun();
}
