/**
	@author: Gabriel Littman
	@created: 05/12/2014

    KOA RESTful CRUD operations


	This module/class is a helper to create generic CRUD+ APIs

	Goal is to help with:
		standard routing
		standard parsing of query parameters
		standard response codes for failures

**/
/**
* @overview This file handles the routes for a resource
  it implements the standard CRUD operations
**/
var config = require('dsp_shared/config/config').get();
var log = config.getLogger('['+__filename+']');
var koa = require('koa');
var _ = require('underscore');
var router = require('koa-router');

// var bodyParser = require('koa-body-parser');

/*
		@param - string resource name
		@param - create function - function(data)
		@param - read function - function(id)
		@param - update function - function(id, data)
		@param - delete function - function(id)
		@param - list function - function(id)
		@param - patch function - function(id, data)
*/
module.exports = function crud(resource, options) {
  var accepted_filters = options.accepted_filters || [];
  var excluded_fields =  options.excluded_fields;

  // create object of excluded fields to be sent to select query
  var excluded = {};
  _.each(excluded_fields, field => {
    excluded[field] = 0;
  });
  var  Model = require('dsp_shared/database/model/'+ options.model);

  var crud_opts = require('./crud_op')(Model);

	var app = router();

  var read_only = options.read_only || false;

  // app.crud_opts = crud_opts;

  //remove underscores from url

  var res_url = '/' + resource.replace(/_/g, '');
  console.log("res_url", res_url);
  /**
  *this function handles CRUD erors
  * @param {Error} error_msg
  * @param {App} application in use
  * @param {Object} result
  * @throws {Error} e
  */
   function handleCRUDError(e, app, result) {
    var error_msgs = [];
    if( e.name === 'ValidationError' ) {
        for( var i in e.errors ) {
            if( e.errors.hasOwnProperty(i) ) {
                error_msgs.push(e.errors[i].message);
            }
        }
        app.throw(error_msgs.join('; '), 400);
    } else if(e.name === 'MongoError' && e.code === 16755) {
      log.error("Bad Geospaial Data", result);
      app.throw("Bad Geospaial Data", 400);
    } else if(e.name === 'MongoError' && e.code === 11000) {
      app.throw("ERROR: Duplicate key: "+e.toString(), 409);
    } else if(e.message === "Can not update host") {
      app.throw(e.message, 400);
    } else {
      app.throw(e);
    }
  }

	//Create
	app.post(res_url, function *(){
        log.info("POST", res_url, this.params, this.request.query);
        log.info("request body", this.request.body)
        // log.info("POST", res_url, this.params, this.request.query, this.request.body);
        var result = null;

        if(read_only) {
          throw(resource+" is read only", 400);
        }

        try {
             // console.log("CREATING FROM POST", resource, this.request.body);
             result = yield crud_opts.create(this.request.body);
             result = yield crud_opts.read(result._id);
             this.body = result;
             this.status = 201;
        } catch (e){
          handleCRUDError(e, this, result);
        }
	});

/**
* @param {String} id - the _id of the particular resource
* @param {Object} response - the response to the request
* used primarily for GET method
* This generator yields result which is the datum or data
* that matches the query and/or id parameter
* @return {Query} data - a mongoose query
*/

  function *get_req(id, response) {
    var data;
    try {
      var query = response.request.query;
      if(id===undefined || id === null) {
        console.log("get", id, query);
        var offset = query.offset || 0;
        var len = query.length;  // Need to manage this on the client we can't always get all of them
        var select = query.select || excluded;
        var order = query.order;

        if(len) {
          len = parseInt(len);
        }
        if(offset) {
          offset = parseInt(offset);
        }
        var all_queries = ["offset", "length", "select", "order"].concat(accepted_filters);
        for(var q in query) {
          if(query.hasOwnProperty(q)) {
            log.debug('querie', q, all_queries, accepted_filters);
            if(!_.contains(all_queries, q)) {
              response.throw("Bad Query Parameter: "+q, 400);
            }
          }
        }

        //filters
        var filter = {};
        for(var i = 0; i < accepted_filters.length; i++) {
          var key = accepted_filters[i];
          if(query[key] !== undefined) {
            filter = filter || {};
            filter[key] = query[key];
            if(typeof filter[key] === 'string' && filter[key].indexOf('|') !== -1) {
              filter[key] = filter[key].split('|');
            }
          }
        }
        data = yield crud_opts.list(offset, len, filter, select, order, true);
        if(response.dsp_env) {
          offset = offset || 0;
          response.dsp_env.total = yield Model.find(filter).count();
          response.dsp_env.offset = Math.min(offset, response.dsp_env.total);
          response.dsp_env.length = data.length;
        }
      } else {
        data = yield crud_opts.read(id, response.query);
      }
      if(data) {
        response.body = data;
      } else {
        response.throw("Resource Not Found", 404);
      }
    } catch (e){
      if(e.name === "CastError" && e.path === '_id') {
        response.throw("Bad Resource ID", 400);
      } else if(e.message.startsWith("Bad Query Parameter")){
        response.throw(e.message, 400);
      } else if(e.message === "Resource Not Found" ){
        response.throw("Resource Not Found", 404);
      }
      else {
        console.warn('Unhandled Error', e.message);
      }
    }
  }

/**
* @param {String} res_url = resource + (optional) id parameter
* @param {function} generator that resolves request
* GET request gets the resource with the target id
**/
	app.get(res_url+'/:id', function *() {
    yield get_req(this.params.id, this);
    console.log("options", options);
	});
  /**
  * @param {String} res_url = resource + (optional) id parameter
  * @param {function} generator that resolves request
  * HEAD request obtains headers
  **/
  	app.head(res_url+'/:id', function *() {
      yield get_req(this.params.id, this);
	});


/**
* @param {String} name of resource
* @return {Object} resource(s)
*/
	app.get(res_url, function *(){
      yield get_req(undefined, this);
	});
  //Head list
	app.head(res_url, function *(){
      yield get_req(undefined, this);
	});



/**
* @param {String} res_url = resource + id parameter
* @param {function} generator
* PUT request overwrites the Object with the corresponding id
*/
  	app.put(res_url+'/:id', function *overWrite(){
    log.info("PUT", res_url, this.params, this.request.query, this.request.body);
    if(read_only) {
      throw(resource+" is read only", 400);
    }

		var id = this.params.id;
		this.body = yield crud_opts.update(id, this.request.body);
	});

/**
* @param {String} res_url = resource + id parameter
* @param {function} generator
* PATCH request updates fields in a particular Object
*/
	app.patch(res_url+'/:id', function *() {
    log.info("PATCH", res_url, this.params.id, this.request.query, this.request.body);
    if(read_only) {
      throw(resource+" is read only", 400);
    }

    try {
  		var id = this.params.id;
  		var result = yield crud_opts.patch(id, this.request.body, this.header['content-type']);
  		if( result ) {
  			this.body = result;
  		} else {
  			this.status = 404;
  		}
    } catch (e){
      handleCRUDError(e, this, result);
    }
	});

/**
* @param {String} res_url = resource + id parameter
* @param {function} generator
* DELETE request removes the object from the database
*/
	app.delete(res_url+'/:id', function *() {
    log.info("DELETE", res_url, this.request.params);
    if(read_only) {
      throw(resource+" is read only", 400);
    }

		var id = this.params.id;
		var result = yield crud_opts.delete(id);
        if( result ) { this.body = result; }
        else { this.status = 404; }
	});

  app[resource+'_callbacks'] = null;


  var k = koa();
  k.use(app.routes());
  k.use(app.allowedMethods());
	return k;
};
