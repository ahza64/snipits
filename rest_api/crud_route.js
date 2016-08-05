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
var log = require('log4js').getLogger('['+__filename +']');
var koa = require('koa');
var _ = require('underscore');
var router = require('koa-router');
var config = require('dsp_shared/config/config').get();
console.log("COFNIG", config);
// var bodyParser = require('koa-body-parser');
var accepted_filters = config.accepted_filters || [];

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

  var Model = require('dsp_shared/database/model/'+resource);
  var crud_opts = require('./crud_op')(Model);

	var app = router();

  var read_only = options.read_only || false;
  
  // app.crud_opts = crud_opts;

	//remove underscores from url
	var res_url = '/'+resource.replace(/_/g, '');
  console.log("res_url", res_url);

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
  
  function *get_req(id, response) {

    var data;
    try {
      if(id===undefined || id === null) {
        console.log("get", id, response.request.query);
        var offset = response.request.query.offset || 0; 
        var len = response.request.query.length;  // Need to manage this on the client we can't always get all of them
        var select = response.request.query.select;
        var order = response.request.query.order;
        
        if(len) {
          len = parseInt(len);
        }
        if(offset) {
          offset = parseInt(offset);
        }
        var all_queries = ["offset", "length", "select", "order"].concat(accepted_filters);
        for(var q in response.request.query) {
          if(response.request.query.hasOwnProperty(q)) {
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
          if(response.request.query[key] !== undefined) {
            filter = filter || {};
            filter[key] = response.request.query[key];
            if(typeof filter[key] === 'string' && filter[key].indexOf('|') !== -1) {
              filter[key] = filter[key].split('|');
            }
          }       
        }

        data = yield crud_opts.list(offset, len, filter, select, order, true);
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

	//Read-One
	app.get(res_url+'/:id', function *() {
    yield get_req(this.params.id, this);
	});
	//Head
	app.head(res_url+'/:id', function *() {
      yield get_req(this.params.id, this);
	});


	//Read-List
	app.get(res_url, function *(){
      yield get_req(undefined, this);
	});
  //Head list
	app.head(res_url, function *(){
      yield get_req(undefined, this);
	});

  

	//Update-Save
	app.put(res_url+'/:id', function *overWrite(){
    log.info("PUT", res_url, this.params, this.request.query);
    // log.info("PUT", res_url, this.params, this.request.query, this.request.body);
    if(read_only) {
      throw(resource+" is read only", 400);
    }
    
    
		var id = this.params.id;      
		this.body = yield crud_opts.update(id, this.request.body);		
	});

	//Update-Patch
	app.patch(res_url+'/:id', function *() {
    log.info("PATCH", res_url, this.params.id, this.request.query);
    // log.info("PATCH", res_url, this.params.id, this.request.query, this.request.body);
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

	//Delete (remove)
	app.delete(res_url+'/:id', function *() {
    log.info("DELTE", res_url, this.request.params);
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
