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
      user: config.db_username,
      password: config.db_password
    };
  }

  getType() {
    return 'elasticsearch';
  }

  create(name, version, api, fields) {
    const self = this;
    return co(function *create_new_schema() {
      // TODO implement schema creation
      return {};
    });
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
              return this.getResource(source.name, source.fields);
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

  getResource(name, fields) {
    return new EsResource(this.config, name, fields);
  }

  find() {
    const self = this;
    return co(function *find_schemas() {
      const options = {
        method: 'GET',
        uri: `http://${self.config.host}:${self.config.port}/${self.config.index}/schemas/_search`,
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
