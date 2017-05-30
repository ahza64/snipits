/**
 * CRUD model of REST service
 */

const co = require('co');
const rp = require('request-promise');

class CrudResource {

  /**
   * @description Resource implementation for REST Service
   * @param {String} name resource name
   * @param {Object} fields fields description
   * @param {Object} config resource configuration
   * @param {String} config.protocol protocol name ("http", "https")
   * @param {String} config.host host name ("localhost", "127.0.0.1" etc.)
   * @param {Number} config.port host port
   * @param {String} config.route default route ("api/v4/trees")
   * @param {String} config.user user name
   * @param {String} config.password user password
   * @param {String} config.dataField REST service response data field
   */
  constructor(name, fields, config) {
    this.name = name;
    this.fields = fields;
    this.config = config || {};
    const protocol = this.config.protocol || 'http';
    this.defaultRoute = `${protocol}://${this.config.host}:${this.config.port}/${this.config.route}`;
  }

  getName() {
    return this.name;
  }

  /**
   * @description Send HTTP request
   * @param {String} method request method: GET, POST, PUT, PATCH, DELETE
   * @param {String} urlPostfix url postfix
   * @param {Object} body request body
   */
  doRequest(method, urlPostfix, body) {
    const options = {
      method: method,
      uri: `${this.defaultRoute}${urlPostfix}`,
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

  prepareData(response) {
    let prepared = response;
    if (response && this.config.dataField) {
      prepared = response[this.config.dataField];
    }
    return prepared;
  }

  /**
  * @description Insert a new object into database
  * @param {Object} data sets the properties of the new object
  * @return {Object}
  */
  create(data) {
    const self = this;
    return co(function *create_doc() {
      let doc = null;
      const response = yield self.doRequest('POST', '', data);
      if (response) {
        doc = self.prepareData(response);
      }
      return doc;
    });
  }

  /**
  * @param {String} id target object's ID
  * @param {String} select filter the fields in result (space delimited?)
  * @return {Object} result the object(s) which match the query
  */
  read(id, select) {
    let route = `/${id}`;
    if (typeof select === 'string') {
      route = route.concat(`?select=${select}`);
    }
    const self = this;
    return co(function *read_by_id() {
      let doc = null;
      const response = yield self.doRequest('GET', route);
      if (response) {
        doc = self.prepareData(response);
      }
      return doc;
    });
  }

  /**
  * @description PATCH request updates an existing object
  * @param {String} id target object's ID
  * @param {Object} data the fields to update
  * @return {Object} result the updated object
  */
  update(id, data) {
    const self = this;
    return co(function *update() {
      let doc = null;
      if (id && data) {
        const response = yield self.doRequest('PATCH', `/${id}`, data);
        if (response) {
          doc = self.prepareData(response);
        }
      }
      return doc;
    });
  }

  /**
  * @description PATCH request updates an existing object.
  * @param {String} id of target object
  * @param {Object} data the fields to update
  * @return {Object} result the updated object
  */
  patch(id, data) {
    return this.update(id, data);
  }

  /**
  * @description Remove the object from the database
  * @param {String} id of target objectsject
  * @param {Object} user user's data
  * @return {Object} data the deleted object
  */
  delete(id) {
    const self = this;
    return co(function *update() {
      let doc = null;
      if (id) {
        const response = yield self.doRequest('DELETE', `/${id}`);
        if (response) {
          doc = self.prepareData(response);
        }
      }
      return doc;
    });
  }

  /**
  * @description Restore the deleted object
  * @param {String} id of target object
  * @return {Object} data the restored object
  */
  undelete(id) {
    return this.update(id, { _deleted: false });
  }

  /**
    * @param {Object} options
    * @param {Number} options.offset skip the first (offset) matches
    * @param {Number} options.length max Number of objects to retrieve
    * @param {Object} options.filter of requirements the object must meet
    * @param {String} options.select return only (select)ed fields
    * @param {String} options.order field to sort by, ascending. If prepended with '-' then descending
    * @param {Boolean} options.lean retun a plain Javascript document rather than a MongooseDocument
    * @param {Object} options.user user's data
    * @return {Array} result the objects that agree with arguments list lists the results of a query
    */
  list(options) {
    const query = Object.assign({}, options);
    if (query.filter) {
      query.filters = query.filter;
      delete query.filter;
    }
    const self = this;
    return co(function *list_gen() {
      let list = [];
      const response = yield self.doRequest('POST', `/query`, query);
      if (response) {
        list = self.prepareData(response);
      }
      return list;
    });
  }

  /**
   * @param {Object} filters
   */
  count(filters) {
    let route = '/count';
    let params = null;
    if (filters) {
      params = Object.keys(filters).map((field) => {
        const value = filters[field];
        let res = null;
        if (Array.isArray(value)) {
          res = `${field}=${value.join(',')}`;
        } else {
          res = `${field}=${value}`;
        }
        return res;
      }).join('&');
      if (params) {
        route = `${route}?${params}`;
      }
    }

    const self = this;
    return co(function *list_gen() {
      let list = [];
      const response = yield self.doRequest('GET', route);
      if (response) {
        list = self.prepareData(response);
      }
      return list;
    });
  }
}

module.exports = CrudResource;
