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

co(function *fake_data_gen() {
  // Create records
  let option = {
    method: 'POST',
    uri: 'http://localhost:3000/api/v4/tests',
    // uri: `http://${config.api_host}:${config.api_port}/api/v4/${schema_name}`,
    body: {},
    json: true
  };

  for (let i = 0; i < 100; i++) {
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
          faker.address.longitude(),
          faker.address.latitude()
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
}).catch((e) => {
  console.error(`error while generating fake data for api v4: ${e}`);
});