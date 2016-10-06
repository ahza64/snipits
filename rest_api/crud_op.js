
/**
    Generic CRUD operations for a MODEL

    Create
    Read
    Update (overwrite)
    Delete

    List
    Patch (apply diff)
*/
var log = require('dsp_shared/config/config').get().getLogger('['+__filename+']');
var _ = require('underscore');
// var moment = require('moment');

var jsonpatch = require('fast-json-patch');
jsonpatch.diff = require('dsp_shared/lib/jsondiff').diff;
require('sugar');
//FIXME - we need to move more of this logic into the mongoose model
// init hook: http://stackoverflow.com/questions/18192804/mongoose-get-db-value-in-pre-save-hook
// and a pre commit hook to calculate the diff.

module.exports = function(Model) {
    var counter = 0;
    var crud_opts = {};

    if(!Model.hasOwnProperty('co_emitter')){
      var Emitter = require('co-emitter');
      Model.co_emitter = new Emitter();
    }

    crud_opts.model = Model;
    /**
    * @param {Object} data sets the properties of the
    *   new object
    *   inserts a new object into database
    * @return {Object} data
    */
    crud_opts.create = function *create(data) {
        // log.info("CREATE", Model.modelName, data);
        // log.debug("model.crud.create", data);
        yield Model.co_emitter.emit('dsp_creating', data);
        data = yield Model.create(data);
        data = yield crud_opts.read(data._id); //apply

        // log.debug("created", [Model.modelName, data]);
        Model.emit('dsp_create', data.toJSON());
        return data;
    };
    /**
    * @param {String} id target object's ID
    * @param {String} query set of requirements the
    * object must meet
    * @return {Object} result the object(s) which match the query
    */
    crud_opts.read = function *read(id, query) {
        // log.info("READ", Model.modelName, id, query);
        var result = Model.find({_id: id});
        if(query && query.select) {
          result = result.select(query.select);
        }
        if( Model.collection.name === 'planables' && Model.modelName !== 'Planable') {
          // log.debug("HMMMMM planable?", id);
          result = result.find({_type: Model.modelName});
        }

        result = yield result.exec();
        // log.debug("got result", result);
        if(result.length === 0) {
          return null;
        }
        result = result[0];

        // console.log("READ QUERY", query, result.translate);
        if(query && query.lang && query.lang !== 'en' && result.translate) {
          result = yield result.translate(query.lang);
        }

        return result;
    };
    /**
    * @param {String} id target object's ID
    * @param {Object} data the data to be updated
    * @return {Object} result the newly updated object
    * updates fields in a given object. If the object does
    * not exist, then create it
    */
    crud_opts.update = function *update(id, data) {
        var c = counter;
        counter++;
        log.info("UPDATE", Model.modelName, id, c);
        // log.debug("UPDATE", Model.modelName, id, data);
        // log.debug("model.crud.update", id, data);
        //FIXME - this doesn't seem to overwrite the resource as I expected
        data._id = id;

        var doc = yield crud_opts.read(id);
        // log.debug("read doc..", doc);
        if( doc === null ) {
          data._id = id;
          return yield crud_opts.create(data);
        }
        var original = JSON.parse(JSON.stringify(doc));


        for( var key in original ) {
            // log.debug("checking ", key, doc[key], data[key])
            if(data[key] === undefined && key !== '__v') {
                // log.debug("removing", key, doc[key], data[key])
                doc[key] = undefined;
            }
        }
        for( key in data) {
            if(data[key] !== original[key] && key !== '__v') {
                doc[key] = data[key];
            }
        }

        // log.debug('saving doc', doc);
        doc.updated = Date.now();
        if(original && original.inc_id && !doc.inc_id) {
          doc.inc_id = original.inc_id;
        }

        // log.debug("co_emit updating", doc._id);
        yield Model.co_emitter.emit('dsp_updating', doc, original);

        // log.debug('saveing', doc.__v, doc);
        yield doc.save();
        var updated = JSON.parse(JSON.stringify(doc));
        var patch_data = {_id: original._id};
        // log.debug(JSON.stringify(updated))
        // log.debug(JSON.stringify(original))
        patch_data.patches = jsonpatch.diff(original, updated);
        // log.debug('UPDATE PATCHES', patch_data['patches'], original.location, updated.location)
        if( patch_data.patches.length > 0 ) {
            // log.debug("EMIT UPDATE", Model.modelName);
            Model.emit('dsp_update', patch_data, updated, original);
        }

        // log.debug("FINISHING UPDATING ",Model.modelName, id, c);
        return doc.toObject();

    };
    /**
    * @param {String} id of target object
    * @return {Object} data the deleted object
    * DELETE request removes the object from the database
    */
    crud_opts.delete = function *remove(id) {
        log.info("DELETE", Model.modelName, id);
        yield Model.co_emitter.emit('dsp_deleting', {_id: id});
        var data = yield Model.findByIdAndRemove(id).exec();
        // log.debug("DELETED DATA", data)
        if( data ) {
            Model.emit('dsp_delete', {_id: data._id});
        }
        return data;
    };
    /**
    * @param {Number} offset skip the first (offset) matches
    * @param {Number} len max Number of objects to retrieve
    * @param {Object} filters of requirements the object must meet
    * @param {String} select return only (select)ed fields
    * @param {String} order field to sort by, ascending. If
      prepended with '-' then descending
    * @param {Boolean} lean retun a plain Javascript document
      rather than a MongooseDocument
    * @return {Array} result the objects that agree with arguments
    * list lists the results of a query
      //FIXME
    */
    crud_opts.list = function *list(offset, len, filters, select, order, lean) {
        log.info("LIST", Model.modelName, {offset: offset, len: len, filters: filters});
        order = order || "created";

        var sort = {};
        if(order.startsWith('-')) {
          sort[order.substring(1)] = -1;
        } else {
          sort[order] = 1;
        }
        var result = Model.find().sort(sort);


        if(select) {
          result = result.select(select);
        }
        if(offset !== undefined) {
            result.skip(offset);
        }
        if(len !== undefined) {
            result.limit(len);
        }
        if(filters) {
          filters = _.mapObject(filters, function(val) {
            // log.debug("FILTER VAL", val);
            if(val) {
              if(typeof val === 'string' && val.startsWith('!')){
                return {'$ne': val.slice(1) };
              } else if(Array.isArray(val)){
                return { $in: val };
              }
            }
            return val;
          });
          // log.debug("FILTERS", filters);
          result = result.find(filters);
        }

        //FIXME - We need a more genric way to handle super classing of workorders
        // log.debug("COLLECTION", Model.collection.name, Model.modelName, Model.name);
        if( Model.collection.name === 'planables' && Model.modelName !== "Planable") {
          result = result.find({_type: Model.modelName});
        }

        try {
          // var s = moment();
          if(lean) {
            result = result.lean();
          }
          var res = yield result.exec();
          // log.debug("LIST QUERY TIME", Model.modelName, {offset: offset, len: len, filters: filters},
          // {count: res.length}, moment().diff(s));
          return res;
        } catch(e) {
          log.error("error listing", e);
          return [];
        }
    };
    /**
    * @param {String} id of target object
    * @param {Object} data the fields to update
    * @param {String} content_type the format of
     the updated function
    * @return {Object} result the updated object
    * PATCH request updates an existing object.
    */
    crud_opts.patch = function *patch(id, data, content_type) {
        //log.info("PATCH", Model.modelName, id, content_type);
        log.info("crudops PATCH", Model.modelName, id, data, content_type);
        var doc = yield crud_opts.read(id);
        if( !doc ) {
          console.error("couldn't find data to patch",Model.modelName, id, data);
          return null;
        }
        //TODO - find a way to not have to convert to string first
        // var original_data = JSON.parse(JSON.stringify(doc));
        var updated = JSON.parse(JSON.stringify(doc)); // Need a deep copy here :(

        if( data._id !== undefined) {
          // assert(data._id===id);
          delete data._id;
        }

        if(content_type === 'application/json-patch+json' ||
           content_type === 'application/json-patch' ) {
               // log.debug("APPLING PATCH", data);
               jsonpatch.apply(updated, data);
        } else {
              _.extend(updated, data);
        }

        return yield crud_opts.update(id, updated);
    };

    return crud_opts;
};
