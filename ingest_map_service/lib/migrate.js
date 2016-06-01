
function *applyMigrationSchema(migration_schema, source_data) {
  var result = {};

  for(var key in migration_schema) {
    if(migration_schema.hasOwnProperty(key)) {
      var value = migration_schema[key];
      if( isGenerator(value) || isPromise(value) ){
        value = yield value(source_data);
      } else if (isFunction(value)) {
        value = value(source_data);
      } else {
        value = source_data[value];
      }

      if(value) {
        result[key] = value;
      }
    }
  }
  return result;
}

function isGenerator(obj) {
  return  isFunction(obj) && obj.constructor.name === 'GeneratorFunction';
}

function isFunction(obj) {
  return typeof obj === "function";
}

function isPromise(obj) {
  return isFunction(obj.then);
}

module.exports = {
  applyMigrationSchema: applyMigrationSchema
};