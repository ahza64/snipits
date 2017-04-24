/**
 * The meta schema model of Elasticsearch
 */

const co = require('co');
const rp = require('request-promise');
const EsResource = require('./resource');

class EsSchema {
  constructor(config) {
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

  create(name, version, api, fields) {
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
        const mapping = self.createSchemaMapping(name, fields);
        console.log(mapping);
        yield rp({
          method: 'PUT',
          uri: `${url}/${name}/_mapping?refresh=true`,
          body: mapping,
          json: true
        });
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
            const getResource = () => {
              return this.getResource(item, source.fields);
            };
            return Object.assign({
              id: item._id,
              _id: item._id,
              _name: source.name,
              _version: source.version,
              _api: source.api,
              __v: source.v,
              getResource: getResource
            }, source.fields);
          }
        });
      }
    }
    return prepared;
  }

  getResource(schema, fields) {
    return new EsResource(this.config, schema._name, fields);
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
}

module.exports = EsSchema;
