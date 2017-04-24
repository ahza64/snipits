/**
 * The meta schema model of Elasticsearch
 */

const co = require('co');
const rp = require('request-promise');
const EsResource = require('./resource');

class EsSchema {
  constructor(name, config) {
    this.name = name;
    this.config = {
      host: config.db_host,
      port: config.db_port,              
      index: config.db_name,
      user: config.db_user,
      password: config.db_pass
    };
  }

  getType() {
    return 'elasticsearch';
  }

  create(name, version, api, fields, storage) {
    const self = this;
    return co(function *create_new_schema() {
      let created = null;
      const timestamp = Date.now();
      const body = {
        name: name,
        version: version,
        api: api,
        v: 0,
        fields: fields,
        storage: storage,
        created: timestamp,
        updated: timestamp
      };
      const url = `http://${self.config.host}:${self.config.port}/${self.config.index}`;
      const response = yield rp({
        method: 'POST',
        uri: `${url}/schemas?refresh=true`,
        body: body,
        json: true
      });
      if (response) {
        created = Object.assign({}, body, { _id: response._id });
        if ((!storage) || (storage === self.name)) {
          const mapping = self.createSchemaMapping(name, fields);
          yield rp({
            method: 'PUT',
            uri: `${url}/${name}/_mapping?refresh=true`,
            body: mapping,
            json: true
          });
        }
      }
      return created;
    });
  }

  createSchemaMapping(name, fields) {
    const properties = {};
    const fieldTypes = {
      'string': { type: 'string' },
      'number': { type: 'double' },
      'date': { type: 'date', format: 'strict_date_optional_time||epoch_millis' },
      'geojson': { type: 'object' }
    };
    Object.keys(fields).forEach((field) => {
      let fieldType = fields[field];
      if (typeof fieldType !== 'string') {
        fieldType = fieldType.type;
      }
      if (typeof fieldType === 'string') {
        fieldType = fieldType.toLowerCase();
      }
      if (fieldType in fieldTypes) {
        properties[`${name}_${field}`] = fieldTypes[fieldType];
      } else {
        console.error(`Init create resource ${name} error: field type ${fieldType} is not allowed.`);
      }
    });
    const mapping = {};
    mapping[name] = { properties: properties};
    return mapping;
  }

  prepareSchemas(schemas) {
    let prepared = [];
    if (schemas && schemas.hits && schemas.hits.hits) {
      const list = schemas.hits.hits;
      if (Array.isArray(list)) {
        prepared = list.map((item) => {
          const source = item._source;
          if (source) {
            return Object.assign({
              id: item._id,
              _id: item._id,
              _name: source.name,
              _version: source.version,
              _api: source.api,
              __v: source.v,
              _storage: source.storage
            }, source.fields);
          }
        });
      }
    }
    return prepared;
  }

  getResource(name, fields, storage) {
    let resource = null;
    if ((!storage) || (storage === this.name)) {
      resource = new EsResource(this.config, name, fields);
    }
    return resource;
  }

  find() {
    const self = this;
    return co(function *find_schemas() {
      const body = { sort: { created: { order: 'asc' } } };
      const options = {
        method: 'POST',
        uri: `http://${self.config.host}:${self.config.port}/${self.config.index}/schemas/_search`,
        body: body,
        json: true
      };

      let schemas = [];
      try {
        schemas = self.prepareSchemas(yield rp(options)); 
      } catch (e) {
        const code = e.statusCode;
        if (![400, 404].includes(code)) {
          console.error('Getting scheams list error:', e.error);
        }
      }

      return schemas;
    });
  }

  close() {}
}

module.exports = EsSchema;
