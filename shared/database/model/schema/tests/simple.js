/* globals describe, it */
const co = require('co');
const config = require('dsp_config/config').get({ log4js: false });
config.schema.mongo_db_name = "minishiva-test";
require('dsp_database/database')(config.schema);
const Schema = require('../../schema');


describe("Mini Schiva Tests", () => {
  it("should store a string", () => {
    return co(function *() {
      yield Schema.remove({ _name: "TestSchema" });
      const testSchmea = yield Schema.create({
        _name: "TestSchema",
        _version: "0.0.1",
        stringTest: "String",
        numTest: { type: "Number", indexed: true, unique: true },
        dateTest: "Date"
      });
      console.log('testSchmea', testSchmea);
      const TestSchema = testSchmea.getModel();
      yield TestSchema.remove();
      const test1 = yield TestSchema.create({ stringTest: "GABE", numTest: 1, dateTest: new Date() });
      // const test2 = yield TestSchema.create({ stringTest: "GABE", numTest: 1, dateTest: new Date() });
    });
  });

  it("should store a string", () => {
    return co(function *() {
      yield Schema.remove({ _name: "TestSchema" });
      const testSchmea = yield Schema.create({
        _name: "TestSchema",
        _version: "0.0.1",
        numTest: Number,
      });
      console.log('testSchmea', testSchmea);
      const TestSchema = testSchmea.getModel();
      yield TestSchema.remove();
      const test1 = yield TestSchema.create({ stringTest: "GABE", numTest: 1, dateTest: new Date() });
      // const test2 = yield TestSchema.create({ stringTest: "GABE", numTest: 1, dateTest: new Date() });
    });
  });

  it("should store a date", () => {
    return co(function *() {
      yield Schema.remove({ _name: "TestSchema" });
      const testSchmea = yield Schema.create({
        _name: "TestSchema",
        _version: "0.0.1",
        dateTest: "Date"
      });
      console.log('testSchmea', testSchmea);
      const TestSchema = testSchmea.getModel();
      yield TestSchema.remove();
      const test1 = yield TestSchema.create({ stringTest: "GABE", numTest: 1, dateTest: new Date() });
      // const test2 = yield TestSchema.create({ stringTest: "GABE", numTest: 1, dateTest: new Date() });
    });
  });

  it("should suport uniq indexes", () => {
    return co(function *() {
      yield Schema.remove({ _name: "TestSchema" });
      const testSchmea = yield Schema.create({
        _name: "TestSchema",
        _version: "0.0.1",
        numTest: { type: "Number", indexed: true, unique: true },
      });
      console.log('testSchmea', testSchmea);
      const TestSchema = testSchmea.getModel();
      yield TestSchema.remove();
      const test1 = yield TestSchema.create({ stringTest: "GABE", numTest: 1, dateTest: new Date() });
      const test2 = yield TestSchema.create({ stringTest: "GABE", numTest: 1, dateTest: new Date() });
    });
  });
});
