/**
 * CRUD model of elasticsearch database
 */

const co = require('co');
const rp = require('request-promise');
const _ = require('underscore');
const jsonpatch = require('fast-json-patch');

class EsResource {

  constructor(config, name, fields) {
    this.config = config;
    this.name = name;
    this.fields = fields;
    this.fieldsWithoutPrefix = {};
    this.fieldsWithPrefix = {};
    Object.keys(fields).forEach((field) => {
      this.fieldsWithoutPrefix[field] = `${name}_${field}`;
      this.fieldsWithPrefix[`${name}_${field}`] = field;
    });
  }

  getName() {
    return this.name;
  }

  prepareItem(item) {
    let prepared = null;
    const source = item._source;
    if (source) {
      prepared = Object.assign({}, source, {
        _id: item._id,
        id: item._id
      });
    }
    return prepared;
  }

  prepareData(data) {
    let prepared = null;
    if (data && data.hits && data.hits.hits) {
      const list = data.hits.hits;
      if (Array.isArray(list)) {
        prepared = list.map(item => this.prepareItem(item));
      }
    } else if (data && data._source) {
      prepared = this.prepareItem(data);
    }
    return this.excludePrefixes(prepared);
  }

  doRequest(method, url, body) {
    const options = {
      method: method,
      uri: `http://${this.config.host}:${this.config.port}/${this.config.index}/${this.name}/${url}`,
      json: true
    };
    if (body) {
      options.body = body;
    }

    return co(function *do_request() {
      let response = null;
      try {
        response = yield rp(options); 
      } catch (e) {
        const code = e.statusCode;
        if (![400, 404].includes(code)) {
          console.error('Do request error:', e.error, options);
        }
      }
      return response;
    });
  }

  /**
  * @param {Object} data sets the properties of the
  *   new object
  *   inserts a new object into database
  * @return {Object} data
  */
  create(data) {
    const self = this;
    return co(function *create_gen() {
      let created = null;
      const timestamp = Date.now();
      const body = Object.assign({
        _deleted: false,
        created: timestamp,
        updated: timestamp
      }, self.includePrefixes(data) );
      const response = yield self.doRequest('POST', '?refresh=true', body);
      if (response) {
        created = Object.assign({}, data, { _id: response._id });
      }
      return created;
    });
  }

  includePrefixes(data) {
    const result = {};
    Object.keys(data).forEach((field) => {
      if (field in this.fieldsWithoutPrefix) {
        result[this.fieldsWithoutPrefix[field]] = data[field];
      } else {
        result[field] = data[field];
      }
    });
    return result;
  }

  excludePrefixes(data) {
    if (Array.isArray(data)) {
      return data.map(item => this.excludePrefixes(item));
    } else {
      const result = {};
      Object.keys(data).forEach((field) => {
        if (field in this.fieldsWithPrefix) {
          result[this.fieldsWithPrefix[field]] = data[field];
        } else {
          result[field] = data[field];
        }
      });
      return result;
    }
  }

  /**
  * @param {String} id target object's ID
  * @param {String} select filter the fields in result (space delimited?)
  * @return {Object} result the object(s) which match the query
  */
  read(id, select) {
    const self = this;
    return co(function *read_gen() {
      let result = null;
      const item = yield self.doRequest('GET', id);
      if (item) {
        const prepared = self.prepareData(item);
        if (prepared && (prepared._deleted === false)) {
          result = prepared;
        }
      }
      return result;
    });
  }

  /**
  * @description Update given object by overwriting the whole object
  * @param {String} id target object's ID
  * @param {Object} data the data to be updated data will be overwritten
  * @param {Object} options
  * @param {Object} options.set - If only update part of the data, then $set it
  * @param {Object} options.upsert - If the object does not exist, then create it
  * @param {Object} options.silent - Does not emit events
  * @return {Object} result the newly updated object
  */
  update(id, data, _options) {
    const self = this;
    const options = _options || {};
    return co(function *update_gen() {
      const body = { doc: self.includePrefixes(data) };
      body.doc.updated = Date.now();
      const response = yield self.doRequest('POST', `${id}/_update?refresh=true`, body);
      let item = null;
      if (response) {
        item = yield self.doRequest('GET', id);
        if (item) {
          item = self.prepareData(item);
        }
      }
      return item;
    });
  }

  /**
  * @description PATCH request updates an existing object.
  * @param {String} id of target object
  * @param {Object} data the fields to update
  * @return {Object} result the updated object
  */
  patch(id, data) {
    const self = this;
    return co(function *patch_gen() {
      const original = self.prepareData(yield self.doRequest('GET', id));
      let updated = null;
      if (original) {
        let patch = { updated: Date.now() };
        if (Array.isArray(data)) {
          jsonpatch.apply(patch, data);
        } else {
          patch = data;
        }

        const response = yield self.doRequest('POST', `${id}/_update?refresh=true`, self.includePrefixes(patch));
        let item = null;
        if (response) {
          updated = Object.assign({}, original, patch);
        }
      }
      return updated;
    });
  }

  /**
  * @param {String} id of target objectsject
  * @return {Object} data the deleted object
  * DELETE request removes the object from the database
  */
  delete(id) {
    const self = this;
    return co(function *delete_gen() {
      const body = { doc: { _deleted: true } };
      const response = yield self.doRequest('POST', `${id}/_update?refresh=true`, body);
      let item = null;
      if (response) {
        item = yield self.doRequest('GET', id);
        if (item) {
          item = self.prepareData(item);
        }
      } 
      return item;
    });
  }

  /**
  * @param {String} id of target object
  * @return {Object} data the deleted object
  * DELETE request removes the object from the database
  */
  undelete(id) {
    const self = this;
    return co(function *undelete_gen() {
      const body = { doc: { _deleted: false } };
      const response = yield self.doRequest('POST', `${id}/_update?refresh=true`, body);
      let item = null;
      if (response) {
        item = yield self.doRequest('GET', id);
        if (item) {
          item = self.prepareData(item);
        }
      } 
      return item;
    });
  }

  /**
    * @param {Object} options
    * @param {Number} options.offset skip the first (offset) matches
    * @param {Number} options.length max Number of objects to retrieve
    * @param {Object} options.filters of requirements the object must meet
    * @param {String} options.select return only (select)ed fields
    * @param {String} options.order field to sort by, ascending. If prepended with '-' then descending
    * @param {Boolean} options.lean retun a plain Javascript document rather than a MongooseDocument
    * @return {Array} result the objects that agree with arguments list lists the results of a query
    */
  list(_options) {
    const self = this;
    const options = _options || {};
    const offset = options.offset || 0;
    const limit = options.length || options.limit || 1000;
    const filters = options.filter;
    const select = options.select;
    let sort = options.order || "created";
    const lean = options.lean;

    let params = [];
    if (offset) {
      params.push(`from=${offset}`);
    }
    if (limit) {
      params.push(`size=${limit}`);
    }

    let queryParams = '';
    if (params.length > 0) {
      queryParams = `?${params.join('&')}`;
    }

    return co(function *list_gen() {
      const query = self.prepareQuery(filters, sort);
      let list = [];
      const response = yield self.doRequest('POST', `_search${queryParams}`, query);
      if (response) {
        list = self.prepareData(response);
      }
      return list;
    });
  }

  prepareQuery(filters, sort) {
    const query = {
      query: {
        bool: {
          must: []
        }
      }
    };
    Object.keys(filters).forEach((field) => {
      let value = filters[field];
      if (typeof value === 'string') {
        if (field === '_deleted') {
          value = value.toLowerCase() === 'true' ? true : false;
        }
      }
      const match = {};
      if (field in this.fieldsWithoutPrefix) {
        match[this.fieldsWithoutPrefix[field]] = value;
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
      if (field in this.fieldsWithoutPrefix) {
        field = this.fieldsWithoutPrefix[field];
      }
      query.sort = {};
      query.sort[field] = {
        order: order
      };
    }
    return query;
  }

  /**
   * @param filters
   */
  count(filters) {
    const self = this;
    const query = self.prepareQuery({ _deleted: false });
    return co(function *get_count() {
      let result = null;
      const response = yield self.doRequest('POST', '_search?size=0', query);
      if (response && response.hits) {
        result = response.hits.total;
      }
      return result;
    });
  }
}

module.exports = EsResource;
