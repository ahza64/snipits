/**
 * The meta schema model of Elasticsearch
 */

const co = require('co');
const rp = require('request-promise');
const log = require('dsp_config/config').get().getLogger(`[${__filename}]`);
const EsResource = require('./resource');

function createSchemaMapping(name, fields, prefixes) {
  const properties = {};
  const fieldTypes = {
    string: { type: 'string' },
    number: { type: 'double' },
    date: { type: 'date' },
    geojson: { type: 'object' }
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
      const fieldName = prefixes ? `${name}_${field}` : field;
      properties[fieldName] = fieldTypes[fieldType];
    } else {
      console.error(`Init create resource ${name} error: field type ${fieldType} is not allowed.`);
    }
  });
  const mapping = {};
  mapping[name] = { properties: properties };
  return mapping;
}

function prepareSchemas(schemas) {
  let prepared = [];
  if (schemas && schemas.hits && schemas.hits.hits) {
    const list = schemas.hits.hits;
    if (Array.isArray(list)) {
      prepared = list.map((item) => {
        const source = item._source;
        let preparedItem = null;
        if (source) {
          preparedItem = Object.assign({
            id: item._id,
            _id: item._id,
            _name: source.name,
            _version: source.version,
            _api: source.api,
            __v: source.v,
            _storage: source.storage,
            _config: source.config
          }, source.fields);
        }
        return preparedItem;
      });
    }
  }
  return prepared;
}

function prepareQuery(filters, sort) {
  const query = {
    query: {
      bool: {
        must: []
      }
    }
  };
  const renamed = {
    id: '_id',
    _name: 'name',
    _version: 'version',
    _api: 'api',
    __v: 'v',
    _storage: 'storage'
  };
  Object.keys(filters).forEach((field) => {
    let value = filters[field];
    if (typeof value === 'string') {
      if (field === '_deleted') {
        value = value.toLowerCase() === 'true';
      }
    }
    const match = {};
    if (field in renamed) {
      match[renamed[field]] = value;
    } else {
      match[field] = value;
    }
    query.query.bool.must.push({
      match: match
    });
  });
  if (sort) {
    let order = 'asc';
    let field = sort;
    if (sort.startsWith('-')) {
      field = sort.substring(1);
      order = 'desc';
    }
    if (field in renamed) {
      field = renamed[field];
    }
    query.sort = {};
    query.sort[field] = {
      order: order
    };
  }
  return query;
}

/* eslint class-methods-use-this: ["error", { "exceptMethods": ["close"] }] */
/* Ignore empty method "close". It created to provide the similar interface as for another storages */

class EsSchema {
  /**
   * @description Schema implementation for Elasticsearch
   * @param {String} name storage name
   * @param {Object} config connection configuration
   * @param {String} config.db_host host name ("localhost", "127.0.0.1" etc.)
   * @param {Number} config.db_port host port
   * @param {String} config.db_name database (index) name
   * @param {String} config.db_user user name
   * @param {String} config.db_pass user password
   * @param {Boolean} config.exclude_fields_prefixes
   */
  constructor(name, config) {
    this.name = name;
    this.config = {
      host: config.db_host,
      port: config.db_port,
      index: config.db_name,
      user: config.db_user,
      password: config.db_pass,
      prefixes: !config.exclude_fields_prefixes
    };
  }

  /**
   * @description Create new schema
   * @param {String} name schema's name
   * @param {String} version schema's version
   * @param {String} api api's version
   * @param {Object} fields schema's fields configuration
   * @param {String} fields[].type field type: "String", "Number", "Date", "GeoJSON"
   * @param {Boolean} fields[].required field is required
   * @param {Boolean} fields[].editable field value can be edited
   * @param {Boolean} fields[].visible field value is visible by default
   * @param {String} storage storage name
   * @param {Object} config resource configuration
   * @param {Object} config.filters filter resource data by user data: { <resource_field_name>: <user_field_name> }
   */
  create(name, version, api, fields, storage, config) {
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
        config: config,
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
          const mapping = createSchemaMapping(name, fields);
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

  /**
   * @description Get resource object
   * @param {String} name resource name
   * @param {Object} fields fields configuration
   * @param {String} storage storage name
   * @param {Object} config resource configuration
   * @return {Object} see {@link EsResource}
   */
  getResource(name, fields, storage, config) {
    const self = this;
    let resource = null;
    if ((!storage) || (storage === self.name)) {
      resource = new EsResource(self.config, name, fields, config);
    } else {
      log.error(`Unable to get resource ${name}. Incorrect storage name: ${storage}.`);
    }
    return Promise.resolve(resource);
  }

  /**
   * @description Get schemas list
   * @param {Object} params filter parameters
   * @return {Object[]} schemas list
   */
  find(params) {
    const self = this;
    return co(function *find_schemas() {
      const body = prepareQuery(params || {}, 'created');
      const options = {
        method: 'POST',
        uri: `http://${self.config.host}:${self.config.port}/${self.config.index}/schemas/_search`,
        body: body,
        json: true
      };

      let schemas = [];
      try {
        schemas = prepareSchemas(yield rp(options));
      } catch (e) {
        const code = e.statusCode;
        if (![400, 404].includes(code)) {
          console.error('Getting scheams list error:', e.error);
        }
      }

      return schemas;
    });
  }

  /**
   * @description close connection
   */
  close() {}
}

module.exports = EsSchema;
