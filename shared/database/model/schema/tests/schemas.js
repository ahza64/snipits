/* globals describe, it */
const co = require('co');
const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
chai.use(require('chai-roughly'));
const config = require('dsp_config/config').get({ log4js: false });
const getSchema = require('../schema');
const fakeSchema = require('./fake_schema.json');

describe("Schema test", () => {
  const timestamp = Date.now();
  const storages = config.schemaTest.storages;

  function checkFieldsValues(item, version, api, fields) {
    assert.strictEqual(item._version, version, 'check schema version');
    assert.strictEqual(item._api, api, 'check schema api version');
    for (const field in fields) {
      assert.deepEqual(item[field], fields[field], `check "${field}" field type`);
    }
  }

  function checkRecord(actual, expected) {
    for (const field in expected) {
      expect(actual[field]).to.roughly.deep.equal(expected[field]);
    }
  }

  function changeFakeRecord(base, fieldToUpdate) {
    const record = Object.assign({}, base);
    Object.keys(fakeSchema).forEach((field) => {
      let updateFieldValue = true;
      if (fieldToUpdate && (field != fieldToUpdate)) {
        updateFieldValue = false;
      }
      if (updateFieldValue) {
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
              coordinates:  [(Math.random()-0.5)*180, (Math.random()-0.5)*180]
            };
            break;
          default:
            record[field] = null;
        }
      }
    });
    return record;
  }

  function *checkOneFieldPatch(resource, id, record) {
    let changed = record;
    for(const field in record) {
      changed = changeFakeRecord(changed, field);
      const patch = {};
      patch[field] = changed[field];
      yield resource.patch(id, patch);
      let updated = yield resource.read(id);
      checkRecord(updated, changed);
    }
  }

  function *checkAllFieldsUpdate(resource, id, record) {
    const patch = changeFakeRecord(record);
    yield resource.update(id, patch);
    const updated = yield resource.read(id);
    checkRecord(updated, patch);
  }

  function *checkRecordDelete(resource, id) {
    // check delete
    yield resource.delete(id);
    const deleted = yield resource.read(id);
    assert.isNotOk(deleted, 'deleted record should be null');
    // check undelete
    yield resource.undelete(id);
    const undeleted = yield resource.read(id);
    assert.isOk(undeleted, 'deleted record should be null');
  }

  for (const name in storages) {
    const storageName = name;
    const savedSchemas = {};
    let schema = null;

    // prepare connection config
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
        // create all resources from "${storageName}" schema
        savedSchemas[storageName] = {};
        for(const resourceStorage in storages) {
          const resourceName = `${timestamp}_${storageName}_${resourceStorage}`;
          const created = yield schema.create(resourceName, `${timestamp}`, 'v4', fakeSchema, resourceStorage);
          savedSchemas[storageName][resourceName] = {};
        }
        // check created resources
        const list = yield schema.find({ _version: `${timestamp}` });
        assert.strictEqual(list.length, Object.keys(storages).length, 'check created schemas count');
        list.forEach((item) => {
          assert.include(Object.keys(savedSchemas[storageName]), item._name, `${item._name} should be in created resources`);
          savedSchemas[storageName][item._name] = item;
          checkFieldsValues(item, `${timestamp}`, 'v4', fakeSchema);
        });
      });
    });

    it(`should create/update/delete records (for "${storageName}" schema)`, () => {
      return co(function *() {
        for (const rname in savedSchemas[storageName]) {
          const resource = yield schema.getResource(savedSchemas[storageName][rname]);
          const record = changeFakeRecord({});
          const saved = yield resource.create(record);
          const id = saved._id;
          checkRecord(saved, record);
          yield checkOneFieldPatch(resource, id, record);
          yield checkAllFieldsUpdate(resource, id, record);
          yield checkRecordDelete(resource, id);
        }
      });
    });

    it(`should disconnect from "${storageName}" storage`, () => {
      schema.closeConnections();
    });
  }

});
