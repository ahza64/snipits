/**
 * @fileOverview This script will generate fake data using api v4
 * Create a schema
 */

require('dsp_shared/config/config').get({ log4js: false });

const util = require('dsp_shared/lib/cmd_utils');

util.connect([]);
const Schema = require('dsp_shared/database/model/schema');

function *copy_records(sourceSchemaName, targetSchemaName) {
  console.log(`Copy records from ${sourceSchemaName} to ${targetSchemaName}`);
  const schemas = yield Schema.find({ _api: "v4" });
  let source = null;
  let target = null;
  for (let i = 0; i < schemas.length; i++) {
    if (schemas[i]._name === sourceSchemaName) {
      source = yield schemas[i].getResource();
    } else if (schemas[i]._name === targetSchemaName) {
      target = yield schemas[i].getResource();
    }
  }

  if (source && target) {
    const count = yield source.count();
    console.log(`${count} records found`);
    const chunkSize = 1000;
    const chunks = Math.ceil(count / chunkSize);
    let copied = 0;
    for (let i = 0; i < chunks; i++) {
      const offset = i * chunkSize;
      const records = yield source.list({ offset: offset, limit: chunkSize });

      // copy records
      for (let j = 0; j < records.length; j++) {
        const id = records[j]._id || records[j].id;
        const rec = Object.assign({}, records[j]);
        ['id', '_id', '__v', 'created', 'updated'].forEach((field) => {
          delete rec[field];
        });

        const saved = yield target.update(id, rec);
        if (!saved) {
          console.log('Unable to update record', id);
          i = chunks;
          break;
        }
      }

      copied += records.length;
      console.log(`Copied ${copied} of ${count} records`);
    }
  }

  setTimeout(() => {
    Schema.closeConnections();
  }, 2000);
}

if (require.main === module) {
  util.bakerGen(copy_records);
  util.bakerRun();
}
