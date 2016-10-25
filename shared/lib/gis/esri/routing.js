var log = require('dsp_config/config').get().getLogger('['+__filename+']');
var _ = require('underscore');
var timer = require('co-timer');

var EsriToken = require('dsp_lib/gis/esri/token');
var Route = require('dsp_lib/gis/esri/route');
var util = require('dsp_lib/gis/esri/util');
var http_get = util.http_get;
var http_post = util.http_post;

require('dsp_lib/starts_with');
var compGeo = require("dsp_lib/gis/esri/compressed_geometry");
var manueverEnum = {
    esriDMTUnknown:	0,
    esriDMTStop: 1,
    esriDMTStraight:	2,
    esriDMTBearLeft:	3,
    esriDMTBearRight:	4,
    esriDMTTurnLeft:	5,
    esriDMTTurnRight:	6,
    esriDMTSharpLeft:	7,
    esriDMTSharpRight:	8,
    esriDMTUTurn:	9,
    esriDMTFerry:	10,
    esriDMTRoundabout:	11,
    esriDMTHighwayMerge:	12,
    esriDMTHighwayExit:	13,
    esriDMTHighwayChange:	14,
    esriDMTForkCenter:	15,
    esriDMTForkLeft:	16,
    esriDMTForkRight:	17,
    esriDMTDepart:	18,
    esriDMTTripItem:	19,
    esriDMTEndOfFerry:	20
};

var SingleVehicleRouting = {
  prepare_route_req : function(workorders){
      var request = {features: []};
      for(var i = 0; i < workorders.length; i++) {
        var w = workorders[i];
    
        var feature = {
              'attributes': {
                  'Name': w.name || w._id
              },
              'geometry': {
                  'x': w.location.coordinates[0],
                  'y': w.location.coordinates[1]
              }
          };
        request.features.push(feature);
      }
      return JSON.stringify(request);
  },




  route_vehicle : function*(workorders, language){
      
      var url ="http://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World/solve";
      var token = yield EsriToken.get();
      // log.debug("route_vehicle >> ", workorders, language);
      language = {"english": "en", "spanish": "es"}[language] || language || "en";

      var params = {
                    token:token,
                    findBestSequence:true,
                    preserverFirstStop:true,
                    preserveLastStop:true,
                    returnStops:true,
                    returnDirections:true,
                    returnRoutes:true,
                    directionsLengthUnits: "esriNAUMiles",
                    f:'json',
                    stops:SingleVehicleRouting.prepare_route_req(workorders),
                    directionsLanguage: language
      };                  
      var response  = yield http_get(url, params);
      
      return SingleVehicleRouting.transformResponse(response, workorders);

  },
  transformResponse: function(response, workorders){
        var travels = [];
        workorders = _.indexBy(workorders, "name");
        if(response !== 'undefined' && response !== null ){
            if(!response.directions) {
		console.error(response);
            } else {
            for (var i = 0; i < response.directions.length; i++) {

              
                 var travel ={};
                 var direction = response.directions[i];                 
                 //find path
                 for(var j = 0; j < response.routes.features.length; j++) {
                   var route = response.routes.features[j];
                   if(direction.routeName === route.attributes.Name) {
                     travel.path =[];
                     _.each(route.geometry.paths, function(path){
                       travel.path = travel.path.concat(path);
                     });
                   }
                 }
                 
                 
                 var startendpoints = direction.routeName.split(' - ');
                 var description;
                 travel.start_location = workorders[startendpoints[0]].location;                 
                 if(workorders[startendpoints[0]]._type === "WorkOrder") {
                   travel.start = workorders[startendpoints[0]]._id || null;
                   description = startendpoints.join(' to ');
                 } else {
                   travel.start = null;
                   description = "to "+startendpoints[1];
                 }
                 travel.end = workorders[startendpoints[1]]._id || null;  
                 travel.end_location = workorders[startendpoints[1]].location;
                 travel.estimated_time = Math.round(direction.summary.totalDriveTime*60);
                 travel.complete_time = null;
                 travel.description = description;  
                 travel._type = "Travel";
                 travel.updated = new Date();
                 travel.created = new Date();                    
                 travel.progress =0; 
                 var features = [];
                 for (j = 0; j < direction.features.length; j++) {                     
                   var attributes = direction.features[j].attributes;
                   if(!attributes.text.startsWith("Start at") && j !== 0) {
                      var feature ={
                                    Shape_Length: attributes.length,
                                    DriveDistance: attributes.length,
                                    ElapsedTime: attributes.time,
                                    Text: attributes.text,
                                    /*SubItemType: 1,*/
                                    paths: [compGeo.decompress(direction.features[j].compressedGeometry)],
                                    Type: manueverEnum[attributes.maneuverType]
                                    /*ArriveTime: 1424393843438,
                                    RouteName: "VEH:548cde17093e2ef7d7f5a259",
                                    ObjectID: 14*/
                                  };
                      features.push(feature);  
                    }          
                 }
                 travel.directions = features; 


                travels.push(travel);
            }
        }
	}
        return travels;
    }
};


var Routing = {
    route_vehicle: SingleVehicleRouting.route_vehicle,

    create_route: function(trucks, workorders, start_time) {
      return new Route(trucks, workorders, start_time);
    },

    get_optimized_route: function*(trucks, workorders, options){
      options = options || {};
      var load = options.load; 
      var use_cache = options.use_cache;

      
        // console.log("get_optimized_route", trucks, workorders, start_time, load, use_cache);
        // http://resources.arcgis.com/en/help/arcgis-rest-api/index.html////02r3000000n4000000      
        var route = Routing.create_route(trucks, workorders, options);
        if(use_cache) {
          route = yield route.load_by_sha1(route.sha1());
        }
        // console.log("GOT ROUTE", route);
        if(route.status === Route.STATUS_NOT_REQUESTED) {
          yield this.request_route(route);
          if( use_cache ) {
            yield route.save();
          }
        }
        
        if( load && route.job_id && 
            (route.status === Route.STATUS_WAITING || job_status === Route.STATUS_READY) ) {
          var pollFeq = 500;
          var timeout = 100000;
          var startTime = Date.now();
          var logFeq = 10000;
					var itr = 0;
          while(true) {
						itr++;
            // console.log('trying to load');
            if(itr % (logFeq/pollFeq) === 0) {
              var dur = Date.now() - startTime;
              log.info("Polling ESRI Route "+(dur/(60*1000)).toFixed(2)+"min elapse");//:", route.job_id, url, params);
            }
            
            route.status_data = yield Routing.check_job(route);
            var job_status = route.status_data.status;
            // console.log("LOADING>>>>", route.status_data.status);
            
            if( job_status === Route.STATUS_READY || job_status === Route.STATUS_REQUEST_FAILED) {              
              if(job_status === Route.STATUS_READY){
                yield Routing.retrieve_job(route);
                Routing.parse_errors(route);
              }
              Routing.parse_messages(route.status_data.messages);
              
              if(use_cache) {
                yield route.save();
              }
              break;
            }

            if(false && Date.now() - startTime > timeout) {
              break;
            } else {
              yield timer(pollFeq);
            }
          }                      
        }
        
        if(route.success === false) {
          var wolen = workorders.length;
          log.debug("got workorder inof ....", wolen, route.bad_workorders);
          var remove = route.bad_workorders;
          if(remove.length > 0) {
            workorders = _.filter(workorders, function(wo) {
              return ! _.contains(remove, wo._id.toString());
            }); 
            log.warn("Bad workorders found, Running get_optimized_route again", remove);
            route = yield Routing.get_optimized_route(trucks, workorders, options);
            route.bad_workorders = route.bad_workorders.concat(remove);
          }
        }
        
        log.debug("GOT NEW ROUTE", route.success);
        return route;
    },
    
    parse_errors: function(route) {
      route.success = route.esri.succeeded.value;
      route.bad_workorders = [];
      var messages = route.status_data.messages;
      for(var i = 0; i < messages.length; i++) {
        var match = /Orders \(Name = \"WO:(.*)\"\) is unlocated./.exec(messages[i].description);
        if(match !== null) {
          route.bad_workorders.push(match[1]);
        }
      }      
    },
  
  
	get_single_truck_route: function *(truck, workorders, start_time){
		var route = Route.single_vehicle(truck, workorders, start_time);
		route.base_url = "https://logistics.arcgis.com/arcgis/rest/services/World/Route/GPServer/FindRoutes";

		
        var token = yield EsriToken.get();		
		
        var submit_job = "/submitJob";
		
        route.data = {          
            stops: JSON.stringify(route.stops).replace(/ /g, ''),
            directions_distance_units: 'Miles',
            analysis_region: 'NorthAmerica',
            reorder_stops_to_find_optimal_routes: true,
            preserve_terminal_stops: "Preserve First",
            populate_directions: true,
            directions_style_name: "NA Navigation"            
        };
		
        var params = {
          token: token,          
          f: 'json'
        };
		
        var get_query = _.extend({}, params, route.data);
        console.log("HERE IS THE QUERY", JSON.stringify(get_query, undefined, 4));
        var data = yield http_get(route.base_url+submit_job, get_query);
        if( data.jobStatus === 'esriJobSubmitted' ) {
            route.job_id = data.jobId;
            route.status = Route.STATUS_WAITING;            
        } else {
            route.status = Route.STATUS_REQUEST_FAILED;
        }
		
		return route;
	},
	
  getResults: function *(route, result_type) {
		var post_fix;
		if(route.base_url.indexOf("VehicleRoutingProblem") !== -1) {
			post_fix = {
				'stops':  "out_stops",
		        'routes':  "out_routes",
		        'directions': "out_directions",
		        'unassigned': "out_unassigned_stops",
		        'succeeded': "solve_succeeded"
			};
		} else {
			post_fix = {  
				"succeeded": "Solve_Succeeded",
				"routes": "Output_Routes",
		        "route_edges": "Output_Route_Edges",
				"directions": "Output_Directions",
				"stops": "Output_Stops"
	      	};      	
      	}
	  
	  
	  
  
  
      var token = yield EsriToken.get();
      var url = route.base_url+'/jobs/'+route.job_id+'/results/'+post_fix[result_type];
      var params = {
        token: token,
        f: 'json'
      };
  
      var data = yield http_get(url, params);
      data.url = url;
      return data;
    },
    
    request_route: function*(route){

        if( !route ) {
          return null;
        }
      
        var token = yield EsriToken.get();        
        // console.log('printing workorders', JSON.stringify(workorders, null, 4));
        // console.log('printing routes', JSON.stringify(routes, null, 4));
        route.base_url = 'https://logistics.arcgis.com/arcgis/rest/services/World/VehicleRoutingProblem'+
						 '/GPServer/SolveVehicleRoutingProblem';
        var submit_job = "/submitJob";
		            
        route.data = {          
            orders: route.orders,
            depots: route.depots,
            routes: route.routes,
            default_date: route.default_date,
            time_units: 'seconds',
            distance_units: 'Miles',
            populate_directions: true,
            directions_style_name: "NA Navigation"            
        };
        route.query = {
          token: token,
          f: 'json'
        };
        
        // route.url = "http://posttestserver.com/post.php"
        // route.query.token = "<TOKEN>"

        // GET REQUEST LOGIC
        route.data.orders = JSON.stringify(route.orders);
        route.data.depots = JSON.stringify(route.depots);
        route.data.routes = JSON.stringify(route.routes);
        var get_query = _.extend({}, route.query, route.data);
        // var data = yield http_get(route.url, get_query);
        
        // POST REQEUST
        var data = yield http_post(route.base_url+submit_job, {}, get_query);
        // console.log("got esri response", data);
        if( data.jobStatus === 'esriJobSubmitted' ) {
            route.job_id = data.jobId;
            route.status = Route.STATUS_WAITING;            
        } else {
            route.status = Route.STATUS_REQUEST_FAILED;
        }

        return route;
    },    

    parse_messages: function(messages){
      
      if(messages) {
        for(var i = 0; i < messages.length; i++){
          var mesg = messages[i];
          var log_type = {"esriJobMessageTypeWarning": "warn",
                          "esriJobMessageTypeError": "error",
                          "esriJobMessageTypeInformative": "info"}[mesg.type];
          log_type = log_type || "info";
          var ignore = ['Executing...', 'Submitted.'];
          if(!_.contains(ignore, mesg.description)) {
            log[log_type]("ESRI MESSAGE", mesg);
          }
        }
      }
      
    },

    check_job: function*(route) {
      // console.log("CHECKIGN JOB....")
      if( route.status === Route.STATUS_WAITING) {
        var token = yield EsriToken.get();
        var url = route.base_url+'/jobs/'+route.job_id;
        var params = {
          token: token,
          returnMessages: true,
          f: 'json'
        };
        
        var data = yield http_get(url, params);
        // console.log("check_job results", data, data.jobStatus, data.jobStatus === 'esriJobSucceeded');
        if( data ) {
          route.status_data = data;
          if(data.jobStatus === 'esriJobSucceeded') {
            route.status = Route.STATUS_READY;
          } else if(data.jobStatus === 'esriJobFailed') {
            route.status = Route.STATUS_REQUEST_FAILED;            
          }
          data.status = route.status;
          route.status_data = data;
        }
        return data;
      }
      
      return route.status_data;
    },
        
    retrieve_job: function*(route){
      if( route.status === Route.STATUS_LOADED ) {
        return route;
      }
        
      var data = {};
      data.succeeded = yield Routing.getResults(route, 'succeeded');
      data.stops = yield Routing.getResults(route, 'stops');
      data.directions = yield Routing.getResults(route, 'directions');
      data.unassigned = yield Routing.getResults(route, 'unassigned');
      data.routes = yield Routing.getResults(route, 'routes');
        

      var ordering = data.stops.value.features || null;
      if( ordering === null ) {
        console.log("COULDN'T GET FEATURES", data);
        return route;
      }

      route.esri = data;
      route.status = Route.STATUS_LOADED;
      route.solution = Routing.format_esri_routing(ordering);
      route.directions = Routing.format_directions(data.routes, data.directions, route.solution);
      return route;        
    },
    
    format_directions: function(routes, directions) {
      if(directions.value.exceededTransferLimit) {
        console.warn("Directions Exceeded Transfer Limit: To many directions...");
      }
      var features = directions.value.features;
      var plans = {};
      var current_travel;
      var start;
      var truck_id;
      for(var i = 0; i < features.length; i++) {
        var feature = features[i];
        // console.log(feature)
        var tmp_truck = feature.attributes.RouteName.split(':')[1];
        if(tmp_truck !== truck_id) {
          truck_id = tmp_truck;
          current_travel = undefined;
        }
        // console.log("truck id", truck_id)
        if(feature.attributes.Type === 18) { //Depart Location
          var location_name = features[i].attributes.Text.substring(7);// "Depart ".length
          location_name = location_name.split(':'); //parse workorder id;
          var type = location_name[0];
          if(type === 'START_LOC') {
            start = null;
          } else {
            start = location_name[1];
          }
          
          if(current_travel) {
            current_travel.end = start; 
          }
          current_travel = {features: [], end: null, start: start, full_path: [["NOOP"]], total_elapse_time: 0};
          plans[truck_id] = plans[truck_id] || [];
          // console.log(plans[truck_id], plans[truck_id].append);
          plans[truck_id].push(current_travel);
          
          //parse wo id "Depart WO:53e8240c137c8fdcfbe63a82"
        } 
        
                
        var data = _.extend({}, feature.attributes);
        if(data.Type === 1) {
          //Arrive a destination, elapse time includes duration at destination
          //removing for our system.
          data.ElapsedTime = 0;
        } if(data.Type === 18) {
          //Depart 
          // cleaning up text ...
          data.Text = "Depart";
        }
        
        if(feature.geometry) {
          // console.log(feature.geometry.paths[0])
          current_travel.full_path.pop();
          _.extend(data, {paths: feature.geometry.paths});
          current_travel.full_path = current_travel.full_path.concat(feature.geometry.paths[0]);
          current_travel.total_elapse_time += data.ElapsedTime;
          // console.log("CURRENT PATH", current_travel.full_path);
        }
        current_travel.features.push(data);
      }
      // features = routes.value.features;
      // for(i = 0; i < features.length; i++) {
      //   feature = features[i];
      //   // console.log( feature.attributes.Name, feature.attributes.OrderCount )
      //   truck_id = feature.attributes.Name.split(':')[1];
      //   plans[truck_id].full_path = feature.geometry.paths;
      //   // console.log("PLAN", plans[truck_id]);
      // }
      
      return plans;
    },
    
    format_esri_routing: function(esri_features) {
      // "attributes": {
      //   "Name": "db1f1217-0486-4f8b-9e60-7cb20455074f|2",
      //   "RouteName": "88374028-9547-11e3-a313-28cfe9149651|8",
      //   "Sequence": 3,
      //   "ObjectID": 1,
      //   "ArriveTime": 1393089304704,
      //   "ArriveTimeUTC": 1393118104704,
      //   "FromPrevDistance": 2.1360880699767573,
      //   "FromPrevTravelTime": 7.857945812866092,
      //   "DepartTime": 1393715704704
      //   "DepartTimeUTC": 1393744504704,
      // }

      var new_plans = {};
      for(var i = 0; i < esri_features.length; i++){
        var feature = esri_features[i];
        var attr = feature.attributes;
        if( attr.Name.slice(0, 3) === "WO:") {
          // var dep = attr.DepartTimeUTC/1000;
          // var arr = attr.ArriveTimeUTC/1000;
          // var estimated_time = dep-arr;

          var truck_id = attr.RouteName.split(':')[1];
          var work_order_id = attr.Name.split(':')[1];
          var sequence =  attr.Sequence - 2;
          
          if(!new_plans[truck_id]) {
            new_plans[truck_id] = {jobs: []};
          }
          
          new_plans[truck_id].jobs[sequence] = work_order_id;
        }        
      }
      return new_plans;
    }
};

module.exports = Routing;
