
/**
    Generic CRUD operations for a MODEL

    Create
    Read
    Update (overwrite)
    Delete

    List
    Undelete
    Patch (apply diff)
*/
const log = require('dsp_config/config').get().getLogger(`[${__filename}]`);
const _ = require('underscore');
const co = require('co');
const Emitter = require('co-emitter');
const jsonpatch = require('fast-json-patch');
jsonpatch.diff = require('dsp_lib/jsondiff').diff;
require('sugar');
// FIXME - we need to move more of this logic into the mongoose model
// init hook: http://stackoverflow.com/questions/18192804/mongoose-get-db-value-in-pre-save-hook
// and a pre commit hook to calculate the diff.


function sanitizeHelper(doc, original, _sanitize_deleted) {
  // clean up doc (hiding mongo implementation details a bit);
  let result = null;
  let sanitize_deleted = _sanitize_deleted;
  if (sanitize_deleted === undefined) {
    sanitize_deleted = true;
  }
  if (doc.toJSON) {
    result = Object.assign({}, doc.toJSON());
  } else {
    result = Object.assign({}, doc);
  }

  // makes sure we don't lose dates
  if (!result.created && original) {
    result.created = original.created;
  }
  if (!result.updated && original) {
    result.updated = original.updated;
  }

  // ensure _id is set
  if (original) {
    if (result._id) {
      result._id = result._id.toString();
    } else {
      result._id = original._id.toString();
    }
  }

  // ensure id is set
  if (!result.id && original) {
    result.id = original.id;
  }
  if (!result.id) {
    result.id = result._id;
  }

  if (sanitize_deleted) {
    delete result._deleted;
  }
  // filter some keys?????
  // __v

  return result;
}

function process_filters(filters, config, user) {
  let f = {};
  if (filters) {
    // log.debug("FILTERS", filters);
    f = _.mapObject(filters, (val) => {
      if (val) {
        if (typeof val === 'string' && val.startsWith('!')) {
          return { $ne: val.slice(1) };
        } else if (Array.isArray(val)) {
          return { $in: val };
        }
      }
      return val;
    });
  }
  if (config && config.filters) {
    Object.keys(config.filters).forEach((field) => {
      const value = user ? user[config.filters[field]] : null;
      f[field] = value;
    });
  }
  return f;
}


class Resource extends Emitter {

  /**
   * @description Resource implementation for MongoDB
   * @param {Object} Model mongoose model
   * @param {String} name resource name
   * @param {Object} config resource configuration
   * @param {Object} config.filters filter resource data by user data: { <resource_field_name>: <user_field_name> }
   */
  constructor(Model, name, config) {
    super();
    this.name = name || Model.modelName.toLowerCase();
    this.counter = 0;
    if (!Model.emitter) {
      Model.emitter = new Emitter();
    }
    this.emitter = Model.emitter;
    this.Model = Model;
    this.config = config;
  }

  getName() {
    return this.name;
  }

  idQuery(id, deleted, user) {
    let query = { _deleted: true };
    if (!deleted) {
      query = { _deleted: { $ne: true } };
    }
    let field = "_id";
    const checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
    if (!checkForHexRegExp.test(id)) {
      field = "id";
    }
    query[field] = id;
    if (this.config && this.config.filters) {
      Object.keys(this.config.filters).forEach((filterField) => {
        const value = user ? user[this.config.filters[filterField]] : null;
        query[filterField] = value;
      });
    }
    return query;
  }

  /**
  * @param {Object} data sets the properties of the
  * @param {Object} user user's data
  *   new object
  *   inserts a new object into database
  * @return {Object} data
  */
  create(data, user) {
    const record = Object.assign({}, data);
    if (this.config && this.config.filters) {
      Object.keys(this.config.filters).forEach((field) => {
        const value = user ? user[this.config.filters[field]] : null;
        record[field] = value;
      });
    }
    const self = this;
    return co(function *create_gen() {
      let result = yield self.Model.create(record);
      result = yield self.read(result._id, null, user); // apply
      self.emit('created', result);
      return result;
    });
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
      const q = self.idQuery(id, false, user);
      let result = self.Model.findOne(q);
      if (select) {
        result = result.select(select);
      }
      result = yield result.exec();
      if (result) {
        return sanitizeHelper(result);
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
      self.counter++;
      if (options.set) {
        Object.assign(options, { overwrite: false });
      } else {
        Object.assign(options, { overwrite: true });
      }

      const original = yield self.read(id, null, options.user);
      sanitizeHelper(data, original, false);
      yield self.Model.update(self.idQuery(id, false, options.user), data, options);
      const updated = yield self.read(id, null, options.user);
      if (updated) {
        // compare may need to ignore __v
        const diff = jsonpatch.diff(original, updated);
        if (diff.length > 0) {
          updated.updated = new Date();
          yield self.Model.update(self.idQuery(id, false, options.user), { updated: updated.updated });
          if (options.silent) {
            yield self.emit('updated', updated, original);
            yield self.emit(`updated:${updated._id}`, updated, original);
            yield self.emit(`updated:${updated.id}`, updated, original);
          }
          return sanitizeHelper(updated);
        }
      }
      return null;
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
      // log.info("PATCH", self.Model.modelName, id, data);
      const doc = yield self.read(id, null, user);
      if (doc) {
        // apply patch
        if (Array.isArray(data)) {
          jsonpatch.apply(doc, data);
        } else {
          Object.assign(doc, data);
        }
        return yield self.update(id, doc, user);
      }
      return null;
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
      const original = yield self.read(id, null, user);
      if (original) {
        yield self.Model.update(self.idQuery(id, false, user), { _deleted: true });
        yield self.emit('deleted', original);
        return original;
      }
      return null;
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
      yield self.Model.update(self.idQuery(id, true, user), { _deleted: false });
      const data = yield self.read(id, null, user);
      if (data) {
        yield self.emit('undeleted', data);
      }
      return data;
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
    * @param {Object} options.user user's data
    * @return {Array} result the objects that agree with arguments list lists the results of a query
    */
  list(_options) {
    const self = this;
    const options = _options || {};
    const offset = options.offset || 0;
    const len = options.length || options.limit || 1000;
    const filters = options.filter;
    const select = options.select;
    const order = options.order || "created";
    const lean = options.lean;
    return co(function *list_gen() {
      log.info("LIST", self.Model.modelName, { offset: offset, len: len, filters: filters });
      const sort = {};
      if (order.startsWith('-')) {
        sort[order.substring(1)] = -1;
      } else {
        sort[order] = 1;
      }
      console.log("SORTING", sort);
      let result = self.Model.find().sort(sort);
      if (select) {
        result = result.select(select);
      }
      if (offset !== undefined) {
        result.skip(offset);
      }
      if (len !== undefined) {
        result.limit(len);
      }

      const f = process_filters(filters, self.config, _options.user);
      if (Object.keys(f).length > 0) {
        result = result.find(f);
      }

      if (lean) {
        result = result.lean();
      }
      try {
        let res = yield result.exec();
        if (res) {
          res = res.map(item => sanitizeHelper(item));
        }
        return res;
      } catch (e) {
        log.error("error listing", e);
        return [];
      }
    });
  }

  /**
  * @param {Object} filters
  * @param {Object} user user's data
  */
  count(filters, user) {
    const f = process_filters(filters, this.config, user);
    return this.Model.find(f).count();
  }
}

module.exports = Resource;
