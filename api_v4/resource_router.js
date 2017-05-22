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

const fakeUser = { companyId: 1 }; // fake user for check ML-353 (Internal data router)

function createRouter(resource, _options) {
  console.log("RESOURCE", resource, _options);
  const options = _options || {};
  const resource_name = options.name || resource.getName();
  const route = router();

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
    const filter = Object.assign({}, query);
    // remove the reserved query params from the filter
    ['offset', 'length', 'limit', 'select', 'order', 'aggregate'].forEach((field) => {
      if (filter[field]) {
        delete filter[field];
      }
    });
    return filter;
  }

  function *exec_query(params, context) {
    const list = yield resource.list(params);
    if (context.dsp_env && (!params.aggregate)) {
      context.dsp_env.total = yield resource.count(params.filter);
      context.dsp_env.offset = params.offset;
      context.dsp_env.length = list.length;
    }
    return list;
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
    if (id === undefined || id === null) {
      const query = context.request.query;
      let offset = query.offset || 0;
      let len = query.length || query.limit;  // Need to manage this on the client we can't always get all of them
      const select = query.select || excluded;
      const order = query.order;
      let aggregate = query.aggregate;
      if (aggregate && (aggregate.indexOf(',') >= 0)) {
        aggregate = aggregate.split(',');
      }

      if (len) {
        len = parseInt(len, 10);
      }
      if (offset) {
        offset = parseInt(offset, 10);
      }
      const filter = processFilters(context.query);
      data = yield exec_query({
        offset: offset,
        length: len,
        filter: filter,
        select: select,
        order: order,
        aggregate: aggregate,
        lean: true,
        user: fakeUser
      }, context);
    } else {
      data = yield resource.read(id, context.query, fakeUser);
    }
    if (data) {
      context.body = data;
    } else {
      throw new Error("Resource Not Found");
    }
  }

  // HEAD request obtains headers for single resoruce
  route.head(`${res_url}/:id`, function *head_route() {
    yield get_req(this.params.id, this);
  });

  // GET resources by id
  route.get(`${res_url}/:id`, function *get_by_id() {
    const id = this.params.id;
    if ((typeof id === 'string') && (id.indexOf(',') !== -1)) {
      const ids = id.split(',').map((val) => {
        const num = parseInt(val, 10);
        return isNaN(num) ? val : num;
      });
      this.body = yield resource.list({
        filter: {
          id: ids
        }
      });
    } else {
      yield get_req(this.params.id, this);
    }
  });

  // HEAD list
  route.head(res_url, function *head_route() {
    yield get_req(undefined, this);
  });

  // GET request for list resource
  route.get(res_url, function *get_list() {
    yield get_req(undefined, this);
  });

  // POST request for list resource
  route.post(`${res_url}/query`, function *post_route() {
    const params = {};
    const body = this.request.body;
    if (body) {
      params.filter = body.filters;
      params.offset = body.offset || 0;
      params.length = body.length || body.limit;
      params.order = body.order;
      params.aggregate = body.aggregate;
    }
    this.body = yield exec_query(params, this);
  });

  if (!read_only) {
    // PUT update request for specific resoruce
    route.put(`${res_url}/:id`, function *put_route() {
      this.body = yield resource.update(this.params.id, this.request.body, { set: true, user: fakeUser });
    });

    // PATCH request updates fields in a particular Object
    route.patch(`${res_url}/:id`, function *patch_route() {
      this.body = yield resource.patch(this.params.id, this.request.body, fakeUser);
    });

    // POST request to create resoruce
    route.post(`${res_url}`, function *post_route() {
      this.body = yield resource.create(this.request.body, fakeUser);
    });

    // DELETE request to delete resoruce
    route.delete(`${res_url}/:id`, function *delete_route() {
      this.body = yield resource.delete(this.params.id, fakeUser);
    });
  }

  const app = koa();
  app.use(body_parser());
  app.use(route.routes());
  app.use(route.allowedMethods());
  return app;
}


module.exports = createRouter;
