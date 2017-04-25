/* globals describe, it */
const co = require('co');
const chai = require('chai');
const assert = chai.assert;
const config = require('dsp_config/config').get({ log4js: false });
const getSchema = require('../schema');
const fakeSchema = require('./fake_schema.json');

describe("Schemas test", () => {
  const timestamp = Date.now();
  const storages = config.schemaTest.storages;
  
  function checkFieldsValues(item, version, api, fields) {
    assert.strictEqual(item._version, version, 'check schema version');
    assert.strictEqual(item._api, api, 'check schema api version');
    for (const field in fields) {
      assert.deepEqual(item[field], fields[field], `check "${field}" field type`);
    }
  }
  
  function createFakeRecord() {
    const record = {};
    Object.keys(fakeSchema).forEach((field) => {
      const type = fakeSchema[field].type;
      switch (type.toLowerCase()) {
        case 'string':
          record[field] = `string_${Math.random()}`;
          break;
        case 'number':
          record[field] = Math.random();
          break;
        case 'date':
          record[field] = new Date();
          break;
        case 'geojson':
          record[field] = {
            type : 'Point',
            coordinates: [(Math.random()-0.5)*180, (Math.random()-0.5)*180]
          }
          break;
        default:
          record[field] = null;
      }
    });
    return record;
  }

  for (const name in storages) {
    const storageName = name;
    const savedSchemas = {};
    let schema = null;
    
    const schemaConfig = JSON.parse(JSON.stringify(config.schemaTest));
    schemaConfig.defaultStorage = storageName;
    for(const storage in schemaConfig.storages) {
      schemaConfig.storages[storage].name = `${storageName}_${storage}`
    }
    
    it(`should connect to "${storageName}" storage`, () => {
      schema = getSchema(schemaConfig);
    });
    
    it(`should create all resources from "${storageName}" storage`, () => {
      return co(function *() {
        savedSchemas[storageName] = {};
        for(const resourceStorage in storages) {
          const resourceName = `${timestamp}_${storageName}_${resourceStorage}`;
          const created = yield schema.create(resourceName, `${timestamp}`, 'v4', fakeSchema, resourceStorage);
          savedSchemas[storageName][resourceName] = {};
        }
        
        const list = yield schema.find({ _version: `${timestamp}` });
        assert.strictEqual(list.length, Object.keys(storages).length, 'check created schemas count');
        list.forEach((item) => {
          assert.include(Object.keys(savedSchemas[storageName]), item._name, `${item._name} should be in created resources`);
          savedSchemas[storageName][item._name] = item;
          checkFieldsValues(item, `${timestamp}`, 'v4', fakeSchema);
        });
      });
    });
    
    it(`should create fake records ("${storageName}")`, () => {
      return co(function *() {
        for (const rname in savedSchemas[storageName]) {
          const resource = schema.getResource(savedSchemas[storageName][rname]);
          const record = createFakeRecord();
          const saved = yield resource.create(record);
          console.log(saved._id);
          // TODO check created record 
        }
      });
    });

    it(`should disconnect from "${storageName}" storage`, () => {
      schema.closeConnections();
    });
  }
  
});
