/**
 * CRUD model of elasticsearch database
 */

const co = require('co');
const rp = require('request-promise');
const jsonpatch = require('fast-json-patch');
const _ = require('underscore');

function prepareClusters(clusters) {
  return clusters.map((cluster) => {
    const item = {
      _id: cluster.key,
      type: 'cluster',
      location: {
        type: 'Point'
      },
      count: cluster.doc_count
    };
    if (cluster.lon && cluster.lon.value && cluster.lat && cluster.lat.value) {
      item.location.coordinates = [cluster.lon.value, cluster.lat.value];
    }
    return item;
  });
}

function prepareAggregations(bucket, field) {
  let prepared = null;
  if (bucket && field) {
    if (bucket[field]) {
      const buckets = bucket[field].buckets;
      if (Array.isArray(buckets)) {
        prepared = [];
        if (field === 'clusters') {
          prepared = prepareClusters(buckets);
        } else {
          buckets.forEach((subbucket) => {
            const subfields = Object.keys(_.omit(subbucket, ['key', 'doc_count']));
            if (subfields.length > 0) {
              const subfield = subfields[0];
              const subitems = prepareAggregations(subbucket, subfield);
              subitems.forEach((subitem) => {
                const item = {};
                item[field] = subbucket.key;
                prepared.push(Object.assign(item, subitem));
              });
            } else {
              const item = {};
              item[field] = subbucket.key;
              item.count = subbucket.doc_count;
              prepared.push(item);
            }
          });
        }
      }
    }
  } else if (bucket && (Object.keys(bucket).length > 0)) {
    prepared = prepareAggregations(bucket, Object.keys(bucket)[0]);
  }
  return prepared;
}

function prepareExtentFilter(field, extent) {
  const extentFilter = {
    geo_bounding_box: {
      type: 'indexed'
    }
  };
  if (extent) {
    extentFilter.geo_bounding_box[field] = {
      top_left: [extent.xmin, extent.ymax],
      bottom_right: [extent.xmax, extent.ymin]
    };
  }
  return extentFilter;
}

class EsResource {

  /**
   * @description Resource implementation for Elasticsearch
   * @param {Object} config connection configuration
   * @param {String} config.host host name ("localhost", "127.0.0.1" etc.)
   * @param {Number} config.port host port
   * @param {String} config.index database (index) name
   * @param {String} config.user user name
   * @param {String} config.password user password
   * @param {Boolean} config.prefixes add prefix to each field name
   * @param {String} name resource name
   * @param {Object} fields fields description
   * @param {Object} resourceConfig resource configuration
   * @param {Object} resourceConfig.filters filter resource data by user data:
   * { <resource_field_name>: <user_field_name> }
   */
  constructor(config, name, fields, resourceConfig) {
    this.config = config || {};
    this.name = name;
    this.fields = fields;
    this.fieldsWithoutPrefix = {};
    this.fieldsWithPrefix = {};
    if (this.config.prefixes) {
      Object.keys(fields).forEach((field) => {
        this.fieldsWithoutPrefix[field] = `${name}_${field}`;
        this.fieldsWithPrefix[`${name}_${field}`] = field;
      });
    }
    this.fieldsWithoutPrefix.id = '_id';
    this.resourceConfig = resourceConfig;
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
      Object.keys(this.fields).forEach((field) => {
        const preparedField = this.fieldsWithoutPrefix[field];
        if (preparedField && (this.fields[field].type.toLowerCase() === 'date')) {
          if (typeof prepared[preparedField] === 'string') {
            prepared[preparedField] = new Date(prepared[preparedField]);
          }
        }
      });
    }
    return prepared;
  }

  prepareData(data) {
    let prepared = null;
    if (data) {
      if (data.aggregations) {
        prepared = prepareAggregations(data.aggregations);
      } else if (data && data.hits && data.hits.hits) {
        const list = data.hits.hits;
        if (Array.isArray(list)) {
          prepared = list.map(item => this.prepareItem(item));
        }
      } else if (data && data._source) {
        prepared = this.prepareItem(data);
      }
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
  * @param {Object} user user's data
  *   new object
  *   inserts a new object into database
  * @return {Object} data
  */
  create(data, user) {
    const self = this;
    return co(function *create_gen() {
      let created = null;
      const timestamp = Date.now();
      const body = Object.assign({
        _deleted: false,
        created: timestamp,
        updated: timestamp
      }, self.includePrefixes(data));
      if (self.resourceConfig && self.resourceConfig.filters) {
        Object.keys(self.resourceConfig.filters).forEach((field) => {
          const itemField = this.getFieldNameWithPrefix(field);
          const value = user ? user[self.resourceConfig.filters[field]] : null;
          body[itemField] = value;
        });
      }
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
      const fieldWithPrefix = this.getFieldNameWithPrefix(field);
      result[fieldWithPrefix] = data[field];
    });
    return result;
  }

  excludePrefixes(data) {
    let result = null;
    if (Array.isArray(data)) {
      result = data.map(item => this.excludePrefixes(item));
    } else {
      result = {};
      Object.keys(data).forEach((field) => {
        if (field in this.fieldsWithPrefix) {
          result[this.fieldsWithPrefix[field]] = data[field];
        } else {
          result[field] = data[field];
        }
      });
    }
    return result;
  }

  checkItem(item, user) {
    let valid = true;
    if (item && item._source && this.resourceConfig && this.resourceConfig.filters) {
      Object.keys(this.resourceConfig.filters).forEach((field) => {
        const itemField = this.getFieldNameWithPrefix(field);
        const value = user ? user[this.resourceConfig.filters[field]] : null;
        if (item._source[itemField] !== value) {
          valid = false;
        }
      });
    }
    return valid;
  }

  /**
  * @param {String} id target object's ID
  * @param {String} select filter the fields in result (space delimited?)
  * @param {Object} user user's data
  * @return {Object} result the object(s) which match the query
  */
  read(id, select, user) {
    const self = this;
    return co(function *read_gen() {
      let result = null;
      const item = yield self.doRequest('GET', id);
      if (item && self.checkItem(item, user)) {
        const prepared = self.prepareData(item);
        if (prepared && (prepared._deleted !== true)) {
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
  * @param {Object} options.user user's data
  * @return {Object} result the newly updated object
  */
  update(id, data, _options) {
    const self = this;
    const options = _options || {};
    return co(function *update_gen() {
      let item = yield self.doRequest('GET', id);
      if (self.checkItem(item, options.user)) {
        item = null;
        const body = { doc: self.includePrefixes(data) };
        body.doc.updated = Date.now();
        const response = yield self.doRequest('POST', `${id}/_update?refresh=true`, body);
        if (response) {
          item = yield self.doRequest('GET', id);
          if (item) {
            item = self.prepareData(item);
          }
        }
      } else {
        item = null;
      }
      return item;
    });
  }

  /**
  * @description PATCH request updates an existing object.
  * @param {String} id of target object
  * @param {Object} data the fields to update
  * @param {Object} user user's data
  * @return {Object} result the updated object
  */
  patch(id, data, user) {
    const self = this;
    return co(function *patch_gen() {
      const item = yield self.doRequest('GET', id);
      let updated = null;
      if (self.checkItem(item, user)) {
        const original = self.prepareData(item);
        if (original) {
          let patch = { updated: Date.now() };
          if (Array.isArray(data)) {
            jsonpatch.apply(patch, data);
          } else {
            patch = data;
          }
          const body = { doc: self.includePrefixes(patch) };
          body.doc.updated = Date.now();
          const response = yield self.doRequest('POST', `${id}/_update?refresh=true`, body);
          if (response) {
            updated = Object.assign({}, original, patch);
          }
        }
      }
      return updated;
    });
  }

  /**
  * @param {String} id of target objectsject
  * @param {Object} user user's data
  * @return {Object} data the deleted object
  * DELETE request removes the object from the database
  */
  delete(id, user) {
    const self = this;
    return co(function *delete_gen() {
      let item = yield self.doRequest('GET', id);
      if (self.checkItem(item, user)) {
        item = null;
        const body = { doc: { _deleted: true } };
        const response = yield self.doRequest('POST', `${id}/_update?refresh=true`, body);
        if (response) {
          item = yield self.doRequest('GET', id);
          if (item) {
            item = self.prepareData(item);
          }
        }
      } else {
        item = null;
      }
      return item;
    });
  }

  /**
  * @param {String} id of target object
  * @param {Object} user user's data
  * @return {Object} data the deleted object
  * DELETE request removes the object from the database
  */
  undelete(id, user) {
    const self = this;
    return co(function *undelete_gen() {
      let item = yield self.doRequest('GET', id);
      if (self.checkItem(item, user)) {
        item = null;
        const body = { doc: { _deleted: false } };
        const response = yield self.doRequest('POST', `${id}/_update?refresh=true`, body);
        if (response) {
          item = yield self.doRequest('GET', id);
          if (item) {
            item = self.prepareData(item);
          }
        }
      } else {
        item = null;
      }
      return item;
    });
  }

  isAggregationRequired(filters, aggregate, user) {
    const self = this;
    return co(function *get_count() {
      let required = false;
      if (aggregate) {
        if ((!Array.isArray(aggregate)) && (typeof aggregate === 'object')) {
          const type = aggregate.type;
          if ((typeof type === 'string') && (type.toLowerCase() === 'geohash')) {
            if (aggregate.min) {
              const total = yield self.count(filters, user);
              if (total >= aggregate.min) {
                required = true;
              }
            } else {
              required = true;
            }
          }
        } else {
          required = true;
        }
      }
      return required;
    });
  }

  /**
    * @param {Object} options
    * @param {Number} options.offset skip the first (offset) matches
    * @param {Number} options.length max Number of objects to retrieve
    * @param {Object} options.filters of requirements the object must meet
    * @param {String} options.select return only (select)ed fields
    * @param {String} options.order field to sort by, ascending. If prepended with '-' then descending
    * @param {String|Array|Object} options.aggregate fields to group data
    * @param {String} options.aggregate.type aggregation type ('geohash')
    * @param {String} options.aggregate.field field name (may looks like 'location.coordinates')
    * @param {Number} options.aggregate.precision precision of geohash
    * @param {Number} options.aggregate.min do aggregation if object count more or equal than min value
    * @param {Boolean} options.lean retun a plain Javascript document rather than a MongooseDocument
    * @param {Object} options.user user's data
    * @return {Array} result the objects that agree with arguments list lists the results of a query
    */
  list(_options) {
    const self = this;
    const options = _options || {};
    const offset = options.offset || 0;
    const limit = options.length || options.limit || 1000;
    const filters = options.filter;
    const sort = options.order || "created";
    let aggregate = options.aggregate;

    return co(function *list_gen() {
      const params = [];
      if (offset) {
        params.push(`from=${offset}`);
      }

      if (!(yield self.isAggregationRequired(filters, aggregate, options.user))) {
        aggregate = null;
      }

      if (aggregate) {
        params.push(`size=0`);
      } else if (limit) {
        params.push(`size=${limit}`);
      }

      let queryParams = '';
      if (params.length > 0) {
        queryParams = `?${params.join('&')}`;
      }

      const query = self.prepareQuery(filters, sort, aggregate, options.user);
      let list = [];
      const response = yield self.doRequest('POST', `_search${queryParams}`, query);
      if (response) {
        list = self.prepareData(response);
      }
      return list;
    });
  }

  getFiltersByUserData(user) {
    const filters = {};
    if (this.resourceConfig && this.resourceConfig.filters) {
      Object.keys(this.resourceConfig.filters).forEach((field) => {
        const value = user ? user[this.resourceConfig.filters[field]] : null;
        filters[field] = value;
      });
    }
    return filters;
  }

  prepareGeohashAggs(field, precision) {
    const fieldName = this.getFieldNameWithPrefix(field);
    return {
      clusters: {
        geohash_grid: {
          field: fieldName,
          precision: precision
        },
        aggs: {
          lat: {
            avg: {
              script: `doc['${fieldName}'].lat`
            }
          },
          lon: {
            avg: {
              script: `doc['${fieldName}'].lon`
            }
          }
        }
      }
    };
  }

  prepareAggsQuery(aggregate, query) {
    if (aggregate && query) {
      if (Array.isArray(aggregate)) {
        const fields = aggregate;
        let subquery = query;
        fields.forEach((field) => {
          const fieldName = this.getFieldNameWithPrefix(field);
          subquery.aggs = {};
          subquery.aggs[field] = {
            terms: {
              field: fieldName
            }
          };
          subquery = subquery.aggs[field];
        });
      } else if (typeof aggregate === 'object') {
        const type = typeof aggregate.type === 'string' ? aggregate.type.toLowerCase() : null;
        if ((type === 'geohash') && (aggregate.field)) {
          const precision = aggregate.precision || 4;
          query.aggs = this.prepareGeohashAggs(aggregate.field, precision);
        }
      }
    }
  }

  getFieldNameWithPrefix(field) {
    let fieldWithPrefix = field;
    if (typeof field === 'string') {
      if (field.indexOf('.') >= 0) {
        // composite field name
        const fields = field.split('.');
        if (fields.length > 0) {
          if (fields[0] in this.fieldsWithoutPrefix) {
            fields[0] = this.fieldsWithoutPrefix[fields[0]];
            fieldWithPrefix = fields.join('.');
          }
        }
      } else if (field in this.fieldsWithoutPrefix) {
        fieldWithPrefix = this.fieldsWithoutPrefix[field];
      }
    }
    return fieldWithPrefix;
  }

  prepareTerms(bool, field, fieldValue) {
    let notEqual = false;
    let value = fieldValue;
    if (typeof value === 'string') {
      if (value.startsWith('!')) {
        value = value.substring(1);
        notEqual = true;
      }
      if (field === '_deleted') {
        value = value.toLowerCase() === 'true';
      }
    }
    const match = {};
    const fieldName = this.getFieldNameWithPrefix(field);
    match[fieldName] = value;
    if (Array.isArray(value)) {
      bool.must.push({
        terms: match
      });
    } else if (typeof value === 'object') {
      if (value.regex) {
        const regexp = {};
        regexp[fieldName] = value.regex;
        bool.must.push({
          regexp: regexp
        });
      } else if (value.extent) {
        bool.must.push(prepareExtentFilter(fieldName, value.extent));
      } else if (value.not) {
        match[fieldName] = value.not;
        if (Array.isArray(value.not)) {
          bool.must_not.push({
            terms: match
          });
        } else {
          bool.must_not.push({
            match: match
          });
        }
      }
    } else if (notEqual) {
      bool.must_not.push({
        match: match
      });
    } else {
      bool.must.push({
        match: match
      });
    }
  }

  prepareOrBlock(bool, filterList) {
    if (bool && Array.isArray(filterList) && (filterList.length > 0)) {
      bool.should = filterList.map(filters => this.prepareBool(filters));
      bool.minimum_should_match = 1;
    }
  }

  prepareBool(filters, user) {
    const query = {
      bool: {
        must: [],
        must_not: []
      }
    };
    const allFilters = Object.assign({}, filters, this.getFiltersByUserData(user));
    Object.keys(allFilters).forEach((field) => {
      if (field === '$or') {
        this.prepareOrBlock(query.bool, allFilters[field]);
      } else {
        this.prepareTerms(query.bool, field, allFilters[field]);
      }
    });
    return query;
  }

  prepareSort(sort) {
    let sortBlock = null;
    if (typeof sort === 'string') {
      let order = 'asc';
      let field = sort;
      if (sort.startsWith('-')) {
        field = sort.substring(1);
        order = 'desc';
      }
      field = this.getFieldNameWithPrefix(field);
      sortBlock = {};
      sortBlock[field] = {
        order: order
      };
    }
    return sortBlock;
  }

  prepareQuery(filters, sort, aggregate, user) {
    const query = {
      query: this.prepareBool(filters, user)
    };
    const sortBlock = this.prepareSort(sort);
    if (sortBlock) {
      query.sort = sortBlock;
    }
    if (aggregate) {
      const fields = typeof aggregate === 'string' ? [aggregate] : aggregate;
      this.prepareAggsQuery(fields, query);
    }
    return query;
  }

  /**
   * @param {Object} filters
   * @param {Object} options.user user's data
   */
  count(filters, user) {
    const self = this;
    const query = self.prepareQuery(filters, null, null, user);
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
