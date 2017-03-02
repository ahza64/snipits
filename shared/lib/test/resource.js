const baker = require('dsp_lib/baker');
const test = require('./functional_test');
const path = require('path');
require('dsp_config/config').get({ log4js: false });
const mongoose = require('mongoose');
const config_db = require('dsp_database/database');
const get_conn = require('dsp_database/connections');
const Resource = require('../resource');
const co = require('co');
const autoIncrement = require('mongoose-auto-increment');
const timer = require('co-timer');

config_db({
  name: "test",
  mongo_db_host: "localhost",
  mongo_db_name: "test",
  mongo_db_port: 27017
});
const connection = get_conn('test');
const schema = new mongoose.Schema({
  field1: { type: String, requried: true },
  field2: { type: String },
  updated: { type: Date, default: Date.now },
  created: { type: Date, default: Date.now },
  id: { type: Number, index: true },
  _deleted: { type: Boolean, index: true },
});


autoIncrement.initialize(connection);
schema.plugin(autoIncrement.plugin, { model: 'ResourceTest', field: 'id', startAt: 1 });
const TestModel = connection.model('ResourceTest', schema);

const IdentityCounters = connection.model("IdentityCounters", {
  model: String,
  field: String,
  count: Number
});


function cleanOutput(data) {
  data.created.setTime(0);
  data.updated.setTime(0);
  return data;
}

function run(update) {
  const out_file = `${path.dirname(__filename)}/resource_test.out`;
  console.log("path", out_file);

  const TestResource = new Resource(TestModel);
  test(out_file, (done) => {
    co(function *run_test() {
      yield IdentityCounters.remove({ model: "ResourceTest" });
      yield TestModel.remove();
      console.log("----- Testing Basic CRUD opperations");
      const data1 = yield TestResource.create({ _id: "111111111111111111111111", field1: "First Field 1" });
      console.log("CREATED", cleanOutput(data1));

      const data2 = yield TestResource.read(1);
      console.log("Created UnCHANGED", data2.created === data1.created);
      console.log("Updated UnCHANGED", data2.updated === data1.updated);
      console.log("READ DATA", cleanOutput(data2));

      const data3 = yield TestResource.update(1, { field1: "Second Field 1", field2: "Frist Field 2" });
      console.log("UPDATED CHANGED", data3.updated !== data2.updated);
      console.log("CLEAN UPDATED", cleanOutput(data3));

      const data4 = yield TestResource.patch(1, { field1: "Thrid Field 1" });
      console.log("PATCHED CHANGED", data4.updated !== data4.updated);
      console.log("PATCHED", cleanOutput(data4));

      let data = yield TestResource.delete(1);
      console.log("DELETED RESOURCE", cleanOutput(data));
      data = yield TestResource.read(1);
      console.log("READ DELETED RESOURCE", data);

      data = yield TestResource.undelete(1);
      console.log("UNDELETED RESOURCE", cleanOutput(data));
      data = yield TestResource.read(1);
      console.log("READ DELETED RESOURCE", cleanOutput(data));

      data = yield TestResource.update(1, { field2: "Second Field 2" });
      console.log("OVERWRITE WITH ONE FIELD", cleanOutput(data));

      yield timer(1000);
      data = yield TestResource.create({ _id: "222222222222222222222222", field1: "First Field 1" });
      console.log("CREATE SECOND RESORUCE", cleanOutput(data));

      data = yield TestResource.list();
      console.log("LIST ALL RESOURCES", data.map(d => cleanOutput(d)));

      data = yield TestResource.list({ limit: 1 });
      console.log("LIMIT 1 RESOURCES", data.map(d => cleanOutput(d)));

      data = yield TestResource.list({ limit: 1, order: "-created" });
      console.log("LIMIT 1 REVERSE", data.map(d => cleanOutput(d)));

      data = yield TestResource.list({ limit: 1, order: "-created", offset: 1 });
      console.log("LIMIT 1 REVERSE OFFSET 1", data.map(d => cleanOutput(d)));

      data = yield TestResource.list({ filters: { id: 2 } });
      console.log("ONLY 2", data.map(d => cleanOutput(d)));

      done(update);
    }).then(() => {
      connection.close();
    }, (err) => {
      console.log("ERROR", err);
      connection.close();
    });
  });
}

if (require.main === module) {
  baker.command(run, { default: true });
  baker.run();
}
