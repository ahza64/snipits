# SCHEMA
Unified access to PostgreSQL, MongoDB and Elasticsearch storages

## Configure Storages
Storages configuration is located in the `schema` block of configuration file:
* `storages` - named list of storages
* `defaultStorage` - name of the storage that contains the schemas list

## Examples

### Create connection
```js
const Schema = require('dsp_shared/database/model/schema');
```

### Get list of all available schemas
```js
const schemas = Schema.find({});
```

### Create new schema
```js
const schemaModel = {
  name: {
    type: 'String',
    required: true,
    editable: true,
    visible: true
  },
  companyId: {
    type: 'Number',
    required: true,
    editable: false,
    visible: false
  },
  birthdate: {
    type: 'Date',
    required: true,
    editable: true,
    visible: true
  },
  location: {
    type: 'GeoJSON',
    required: true,
    editable: false,
    visible: false
  }
};

/*
 * This config allows to filter the documents based on user's data.
 * If config is undefined all users will get an access to all records.
 */
const schemaConfig = {
  filters: {
    companyId: 'companyId'
  }
};

const storageName = null; // null means the resource will be created in the default storage

yield Schema.create('users', '0.0.1', 'v4', schemaModel, storageName, schemaConfig);
```

### Get resources
`Resource` is an object that provides methods to create, update and delete documents of defined type.
```js
schemas.forEach((schema) => {
  const resource = schema.getResource();
});
```
Resource contains methods:
* list
* count
* read
* create
* update
* delete
* undelete
> See `shared/database/model/schema/mongo/resource.js` jsdocs to get more detailed information about above listed methods.

### Close all connections
```js
Schema.closeConnections(); // close all connections when Schema object is not needed anymore
```
