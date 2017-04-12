/**
 * CRUD model of PostgreSQL table
 */

const co = require('co');
const _ = require('underscore');
const jsonpatch = require('fast-json-patch');

class PostgresResource {

  constructor(name, model) {
    this.name = name;
    this.model = model;
  }

  getName() {
    return this.name;
  }

  prepareData(data) {
    if (data) {
      if (Array.isArray(data)) {
        return data.map(item => this.prepareData(item));
      } else {
        const prepared = _.omit(data, ['createdAt', 'updatedAt']);
        prepared.id = prepared._id;
        prepared.created = data.createdAt;
        prepared.updated = data.updatedAt;
        return prepared;
      }
    } else {
      return null;
    }
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
      const result = yield self.model.create(data);
      return self.prepareData(result);
    });
  }

  /**
  * @param {String} id target object's ID
  * @param {String} select filter the fields in result (space delimited?)
  * @return {Object} result the object(s) which match the query
  */
  read(id, select) {
    const self = this;
    return co(function *read_gen() {
      const result = yield self.model.findOne({ where: { _id: id, _deleted: false }, raw: true });
      return self.prepareData(result);
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
      const affected = yield self.model.update(data, { where: { _id: id } });
      if (affected[0] > 0) {
        const updated = yield self.model.findOne({ where: { _id: id } });
        return self.prepareData(updated);
      } else {
        return null;
      }
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
      const original = yield self.model.findOne({ where: { _id: id }, raw: true });
      if (original) {
        const patch = {};
        if (Array.isArray(data)) {
          jsonpatch.apply(patch, data);
        } else {
          patch = data;
        }

        const affected = yield self.model.update(patch, { where: { _id: id } });
        if (affected[0] > 0) {
          return Object.assign({}, original, patch);
        } else {
          return original;
        }
      } else {
        return null;
      }
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
      const original = yield self.model.findOne({ where: { _id: id }, raw: true });
      if (original) {
        const affected = yield self.model.update({ _deleted: true }, { where: { _id: id } });
        const deleted = affected[0] > 0;
        return Object.assign(original, { _deleted: deleted });
      }
      return null;
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
      const original = yield self.model.findOne({ where: { _id: id }, raw: true });
      if (original) {
        const affected = yield self.model.update({ _deleted: false }, { where: { _id: id } });
        const undeleted = affected[0] > 0;
        return Object.assign(original, { _deleted: !undeleted });
      }
      return null;
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
    let order = options.order || "createdAt";
    const lean = options.lean;

    return co(function *list_gen() {
      const orderParams = [];
      if (order) {
        let orderDirection = 'ASC';
        if (order.startsWith('-')) {
          order = order.substring(1);
          orderDirection = 'DESC';
        }
        orderParams.push([order, orderDirection]);
      }
      console.log(filters);
      const list = yield self.model.findAll({
        offset: offset,
        limit: limit,
        where: self.prepareFilters(filters),
        order: orderParams,
        raw: true
      });
      return self.prepareData(list);
    });
  }

  prepareFilters(filters) {
    const prepared = {};
    Object.keys(filters).forEach((field) => {
      if (typeof filters[field] === 'string') {
        if (field === '_deleted') {
          prepared[field] = filters[field].toLowerCase() === 'true' ? true : false;
        } else {
          prepared[field] = filters[field];
        }
      } else {
        prepared[field] = filters[field];
      }
    });
    return prepared;
  }

  /**
   * @param filters
   */
  count(filters) {
    const self = this;
    return co(function *get_count() {
      return yield self.model.count({ where: self.prepareFilters(filters) });
    });
  }
}

module.exports = PostgresResource;
