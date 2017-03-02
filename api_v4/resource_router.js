/*
 * @fileoverview Resource Router
 * Resource Router
 * Takes a resources that supports CRUD operations and turns it into a web app
 */
const koa = require('koa');
const router = require('koa-router');
const body_parser = require('koa-body-parser');
const _ = require('underscore');
/**
 * @module api/router/resource
 * @description create a resource route app
 * @example
 * var app = require('koa')();
 * var mount = requiare('koa-mount');
 * var user_routes = require('resource/router')(user_resource, {read_only: true});
 * app.use(mount('/api', user_routes));
 * app.listen('3000');
 *
 *
 * @param {String} resource resource name
 * @param {String} directory based directory of resources
 * @param {Object} options
 * @param {Object} options.read_only  Routes are in read only mode
 * @param {Array} excluded_fields  Array of fields to be excluded from resource
 * @return {Object} app router
 */


function createRouter(resource, _options) {
  console.log("RESOURCE", resource, _options);
  const options = _options || {};
  const resource_name = options.name || resource.getName();
  const route = router();
  const accepted_filters = options.accepted_filters || [];

  // remove underscores from url
  const res_url = `/${resource_name.replace(/_/g, '')}`;
  const read_only = options.read_only || false;

  // create object of excluded fields to be sent to select query
  const excluded_fields = options.excluded_fields;
  const excluded = {};
  _.each(excluded_fields, (field) => {
    excluded[field] = 0;
  });


  function processFilters(query) {
    // check api query keys against accepted values
    const valid_queries = ["offset", "length", "select", "order"].concat(accepted_filters);
    const keys = Object.keys(query);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (!_.contains(valid_queries, key)) {
        throw new Error(`Bad Query Parameter: ${key}`);
      }
    }

    // filters
    const filter = {};
    for (let i = 0; i < accepted_filters.length; i++) {
      const key = accepted_filters[i];
      let value = query[key];
      if (value !== undefined) {
        if (typeof value === 'string') {
          value = filter[key].split('|');
        }
        filter[key] = value;
      }
    }
    return filter;
  }


  /**
  *this function handles CRUD erors
  * @param {Error} error_msg
  * @param {App} application in use
  * @param {Object} result
  * @throws {Error} e
  */
  function handleCRUDError(e, context, result) {
    if (e.name === 'ValidationError') {
      const error_msgs = Object.keys(e.errors).map((key) => {
        return e.errors[key].message;
      });
      context.throw(error_msgs.join('; '), 400);
    } else if (e.name === 'MongoError' && e.code === 16755) {
      console.error("Bad Geospaial Data", result);
      context.throw("Bad Geospaial Data", 400);
    } else if (e.name === 'MongoError' && e.code === 11000) {
      context.throw(`ERROR: Duplicate key: ${e.toString()}`, 409);
    } else if (e.message === "Can not update host") {
      context.throw(e.message, 400);
    } if (e.name === "CastError" && e.path === '_id') {
      context.throw("Bad Resource ID", 400);
    } else if (e.message.startsWith("Bad Query Parameter")) {
      context.throw(e.message, 400);
    } else if (e.message === "Resource Not Found") {
      context.throw("Resource Not Found", 404);
    } else {
      console.warn('Unhandled Error', e.message);
      context.throw(e);
    }
  }

  /*
  * @param {String} id - the _id of the particular resource
  * @param {Object} response - the response to the request
  * used primarily for GET method
  * This generator yields result which is the datum or data
  * that matches the query and/or id parameter
  * @return {Query} data - a mongoose query
  */
  function *get_req(id, context) {
    let data;
    try {
      if (id === undefined || id === null) {
        const query = context.request.query;
        console.log("get", query);
        let offset = query.offset || 0;
        let len = query.length || query.limit;  // Need to manage this on the client we can't always get all of them
        const select = query.select || excluded;
        const order = query.order;

        if (len) {
          len = parseInt(len, 10);
        }
        if (offset) {
          offset = parseInt(offset, 10);
        }
        const filter = processFilters(context.query);
        data = yield resource.list({ offset: offset,
          length: len,
          filter: filter,
          select: select,
          order: order,
          lean: true });
        if (context.dsp_env) {
          offset = offset || 0;
          context.dsp_env.total = yield resource.count(filter);
          context.dsp_env.offset = Math.min(offset, context.dsp_env.total);
          context.dsp_env.length = data.length;
        }
      } else {
        data = yield resource.read(id, context.query);
      }
      if (data) {
        context.body = data;
      } else {
        throw new Error("Resource Not Found");
      }
    } catch (e) {
      handleCRUDError(e, context);
    }
  }


  // HEAD request obtains headers for single resoruce
  route.head(`${res_url}/:id`, function *head_route() {
    yield get_req(this.params.id, this);
  });


  // GET single resource
  route.get(`${res_url}/:id`, function *() {
    yield get_req(this.params.id, this);
  });

  // HEAD list
  route.head(res_url, function *() {
    yield get_req(undefined, this);
  });
  // GET request for list resource
  route.get(res_url, function *() {
    yield get_req(undefined, this);
  });


  if (!read_only) {
    // PUT update request for specific resoruce
    route.put(`${res_url}/:id`, function *overWrite() {
      try {
        this.body = yield resource.update(this.params.id, this.request.body);
      } catch (e) {
        handleCRUDError(e, this, this.body);
      }
    });

    // PATCH request updates fields in a particular Object
    route.put(`${res_url}/:id`, function *overWrite() {
      try {
        this.body = yield resource.patch(this.params.id, this.request.body);
      } catch (e) {
        handleCRUDError(e, this, this.body);
      }
    });

    // POST request to create resoruce
    route.post(`${res_url}`, function *post_route() {
      try {
        this.body = yield resource.create(this.request.body);
      } catch (e) {
        handleCRUDError(e, this, this.body);
      }
    });
  }

  const app = koa();
  app.use(body_parser());
  app.use(route.routes());
  app.use(route.allowedMethods());
  return app;
}


module.exports = createRouter;
