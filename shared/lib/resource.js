
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
  let result = doc;
  let sanitize_deleted = _sanitize_deleted;
  if (sanitize_deleted === undefined) {
    sanitize_deleted = true;
  }
  if (doc.toJSON) {
    result = doc.toJSON();
  }

  // makes sure we don't lose dates
  if (!result.created) {
    result.created = original.created;
  }
  if (!result.updated) {
    result.updated = original.updated;
  }

  // ensure _id is set
  if (result._id) {
    result._id = result._id.toString();
  } else {
    result._id = original._id.toString();
  }
  // ensure id is set
  if (!result.id && original) {
    result.id = original.id;
  }

  if (sanitize_deleted) {
    delete result._deleted;
  }
  // filter some keys?????
  // __v

  return result;
}

function process_filters(filters) {
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
  return f;
}


class Resource extends Emitter {

  constructor(Model, name) {
    super();
    this.name = name || Model.modelName.toLowerCase();
    this.counter = 0;
    if (!Model.emitter) {
      Model.emitter = new Emitter();
    }
    this.emitter = Model.emitter;
    this.Model = Model;
  }

  getName() {
    return this.name;
  }

  static idQuery(id, deleted) {
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
    return query;
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
      let result = yield self.Model.create(data);
      result = yield self.read(result._id); // apply
      self.emit('created', result);
      return result;
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
      const q = Resource.idQuery(id);
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

      const original = yield self.read(id);
      sanitizeHelper(data, original, false);
      yield self.Model.update(Resource.idQuery(id), data, options);
      const updated = yield self.read(id);
      if (updated) {
        // compare may need to ignore __v
        const diff = jsonpatch.diff(original, updated);
        if (diff.length > 0) {
          updated.updated = new Date();
          yield self.Model.update(Resource.idQuery, { updated: updated.updated });
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
  * @return {Object} result the updated object
  */
  patch(id, data) {
    const self = this;
    return co(function *patch_gen() {
      // log.info("PATCH", self.Model.modelName, id, data);
      const doc = yield self.read(id);
      if (doc) {
        // apply patch
        if (Array.isArray(data)) {
          jsonpatch.apply(doc, data);
        } else {
          Object.assign(doc, data);
        }
        return yield self.update(id, doc);
      }
      return null;
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
      const original = yield self.read(id);
      if (original) {
        yield self.Model.update(Resource.idQuery(id), { _deleted: true });
        yield self.emit('deleted', original);
        return original;
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
      yield self.Model.update(Resource.idQuery(id, true), { _deleted: false });
      const data = yield self.read(id);
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

      if (filters) {
        const f = process_filters(filters);
        // log.debug("FILTERS", filters);
        result = result.find(f);
      }

      if (lean) {
        result = result.lean();
      }
      try {
        const res = yield result.exec();
        // TODO sanitize these?
        return res;
      } catch (e) {
        log.error("error listing", e);
        return [];
      }
    });
  }

  /**
   * @param filters
   */
  count(filters) {
    const f = process_filters(filters);
    return this.Model.find(f).count();
  }
}

module.exports = Resource;
