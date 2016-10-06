var log = require('dsp_config/config').get().getLogger('['+__filename+']');
var moment = require('moment');
function date(t) {
  return moment(t).zone("-0700");
}
var _ = require('underscore');
var fs = require('co-fs');
var hash = require('object-hash');


var Route = function(trucks, workorders, options){
  options = options || {};
  var start_time = options.start_time;
  var staging_area = options.staging_area;
  var max_work_opt = options.max_work || Number.MAX_SAFE_INTEGER;
  
    if( !trucks || !workorders || workorders.length === 0 || trucks.length === 0  ) {
      return this;
    }
      
    // console.log("CREATING FEATURES", trucks, workorders);
    var orders = {features: []};
    var feature;
    // console.log("got workorders", workorders);
  
    var total_time = 0;
    for( var i = 0; i < workorders.length; i++) {
      var w = workorders[i];
      if(w.estimated_time === undefined) {
        log.error("ATTEMPTING TO PLAN UNESTIMATED WORKORDER", w._id, w.work_type);
        w.estimated_time = 20*60;
      }
      total_time += w.estimated_time;
      total_time += 15*60;
      // log.debug("TOTALTIME", w.estimated_time, total_time, w._id);
    }

    for( i = 0; i < trucks.length; i++) {
      var t = trucks[i];
      t.estimated_time = t.estimated_time || 0;
      total_time += t.estimated_time;
      // log.debug("TOTALTIME2", t.estimated_time, total_time);
    }
  
  
  
  
    var work_type_map = {};
    
    _.each(workorders, function(wo){
      work_type_map[wo.work_type] = work_type_map[wo.work_type] || {count: 0, total_time: 0, vehicles: 0};
      work_type_map[wo.work_type].count++;
      work_type_map[wo.work_type].total_time += wo.estimated_time; 
    });
    
    _.each(work_type_map, function(map, work_type){
      _.each(trucks, function(veh){
        if(_.contains(veh.work_types, work_type)){
          work_type_map[work_type].vehicles++;
        }
      });
    });
  
    log.debug("CONFIGURED WORK TYPES", work_type_map);
  
  
    var max_work_per_veh = 0;
    _.each(trucks, function(veh){
      veh.max_wo_count = 0;
      veh.total_time = 0;
      _.each(veh.work_types, function(work_type){
        if(work_type_map[work_type]) {
          var work_type_info = work_type_map[work_type];
          var veh_count = Math.min(work_type_info.vehicles, work_type_info.count);
          veh.max_wo_count += Math.ceil(work_type_info.count/veh_count);
          veh.total_time += Math.ceil(work_type_info.total_time/veh_count);
          max_work_per_veh = Math.max(veh.max_wo_count, max_work_per_veh);
        }
      });
      log.debug("VEH WORK", veh.work_types, veh.max_wo_count);
    });
    
  
  
    //don't use all the routes if we don't have enough work
    var truck_count = Math.min(trucks.length, workorders.length);

    var avg_wo_time = Math.ceil(total_time/workorders.length);

    // var work_per_veh = Math.ceil(workorders.length/truck_count);
    var work_per_veh = Math.min(max_work_opt, max_work_per_veh);

    //NOTE: There is an assumption here that all vehicles will have a similar amount of work and workorders are of similar 	
    //      duration. this may not be true for example inspectors probably have a lot more work than trimmers
    var plan_dur = avg_wo_time * work_per_veh;
    
    plan_dur = Math.min(plan_dur, 8*60*60);
    log.debug("PLAN DUR INFO", {truck_count: truck_count, 
                                wo_len: workorders.length, 
                                total_time: total_time, 
                                avg_wo_time: avg_wo_time, 
                                work_per_veh: work_per_veh, 
                                plan_dur: plan_dur});
    log.info("CALCULATED PLAN DURATON HOURS: ", (plan_dur/60)/60);
    // console.log("ESRI INPUT", {wo_len: workorders.length, truck_len: truck_count,
    //                             avg_wo_time: avg_wo_time, work_per_veh: work_per_veh, plan_dur: plan_dur});

    var work_start = date(start_time);
    var work_end = date(work_start);
    work_end.add(plan_dur, 'seconds');

    log.debug("PLAN DUR INFO", {truck_count: truck_count, 
                                wo_len: workorders.length, 
                                total_time: total_time, 
                                avg_wo_time: avg_wo_time, 
                                work_per_veh: work_per_veh, 
                                plan_dur: plan_dur});	
    log.info("START END", work_start.toString(), work_end.toString());
    for( i = 0; i < workorders.length; i++) {
        w = workorders[i];
		
    		var specialties = null;
    		if(w.work_type) {
    			specialties = [w.work_type]; 
    		}
    		//add other specialties (i.e. equipment types)
    		if(specialties) {
    			specialties = specialties.join(' ');
    		}
		
        feature = {
            'attributes': {
                'Name': "WO:"+w._id,
                'ServiceTime': w.estimated_time,
                'Revenue': w.directly_effected_customers,
                'SpecialtyNames': specialties,
                'TimeWindowStart1': work_start.valueOf(),//format('MM/DD/YYYY hh:mm:ss A'),
                'TimeWindowEnd1': truck_count > 1 ? work_end.valueOf():undefined,//format('MM/DD/YYYY hh:mm:ss A') : undefined,
                'MaxViolationTime1': truck_count > 1 ? 0 : undefined,
                'RouteName': null
            },
            'geometry': {
                'x': w.location.coordinates[0],
                'y': w.location.coordinates[1]
            }
        };

        if(w.sequence && w.vehicle) {
          log.debug("ADDING SEQUENCE", w.sequence, w.vehicle);
          feature.attributes.Sequence = w.sequence+1;
          feature.attributes.RouteName = "VEH:"+w.vehicle;
          feature.attributes.AssignmentRule = 1;
        } 
        // if(w._type === "Outage") {
        //   feature.attributes.Sequence = 1;
        // }
      
        orders.features.push(feature);
    } 


  
    // truck depots - these are needed for starting locations
    var depots = {features: []};
    for(i = 0; i < truck_count; i++) {
        t = trucks[i];
        feature = {
          attributes: {
            Name: "START_LOC:"+t._id
          },
          geometry: {
            x: t.location.coordinates[0],
            y: t.location.coordinates[1]
          }
        };            
        depots.features.push(feature);
    }

    //END DEPOT:  ALL TRUCKS SHOULD END HERE
    if(staging_area) {
      var end_depo = {
        attributes: {
          Name: staging_area.name
        },
        geometry: {
          x: staging_area.location.coordinates[0], y: staging_area.location.coordinates[1],
        }
      };            
      depots.features.push(end_depo);      
    } else {
      end_depo = {
        attributes: {
          Name: "Dispatchr HQ"
        },
        geometry: {
          x: -122.0226844, y: 37.3362419,
          // x: -122.411245, y: 37.777597,
        }
      };            
      depots.features.push(end_depo);      
    }


    var routes = {features: []};
    for( i = 0; i < truck_count; i++) {
        t = trucks[i];
				specialties = t.work_types || []; ////can add more specialties here (i.e. truck type)
	
				if(specialties.length > 0) {
					specialties = specialties.join(' ');
				} else {
					specialties = null;
				}

        feature = {
            attributes: {
                Name: "VEH:"+t._id,
                StartDepotName: "START_LOC:"+t._id,
                EndDepotName: null,
                MaxOrderCount:Math.min(t.max_wo_count, max_work_opt, 200), //200 is a hard max for arcgis online
                CostPerUnitDistance: 0,
								SpecialtyNames: specialties,
                CostPerUnitTime: "0.00001",
                EarliestStartTime: work_start.add(t.estimated_time, 'seconds').valueOf(),//format('hh:mm:ss A'),
                LatestStartTime: work_start.add(t.estimated_time, 'seconds').valueOf(),//format('MM/DD/YYYY hh:mm:ss A'),
                // MaxTotalTime: 36*60*60
                // ,
                // 'MaxTotalTime': plan_dur
            },
            'geometry': {
                'x': t.location.coordinates[0],
                'y': t.location.coordinates[1]
            }
        }; 
        if(feature.attributes.MaxOrderCount > 0) {
          
          routes.features.push(feature);
        }else {
          log.warn("Route not included in plan", feature);
        }
    }
  
    this.status = Route.STATUS_NOT_REQUESTED;
    this.type = Route.TYPE_ROUTE;
    this.default_date = work_start.valueOf();
    this.orders = orders;
    this.depots = depots;
    this.routes = routes;      
    
    return this;    
};

Route.single_vehicle = function(truck, workorders, start_time) {
	var route = new Route();
	
    var work_start = date(start_time);
    // var work_end = date(work_start);
    // work_end.add(plan_dur, 'seconds');
	
	
	var stops = {features: []};
	var w;
    for(var i = 0; i < workorders.length; i++) {
        w = workorders[i];
		
		
        var feature = {
            'attributes': {
                'Name': "WO:"+w._id,
                'AdditionalTime': w.estimated_time,
                'TimeWindowStart': work_start.format('MM/DD/YYYY hh:mm:ss A'),
                // 'TimeWindowEnd': work_end.format('MM/DD/YYYY hh:mm:ss A'),
                'RouteName': null
            },
            'geometry': {
                'x': w.location.coordinates[0],
                'y': w.location.coordinates[1]
            }
        };

        if(w.sequence && w.vehicle) {
          console.log("ADDING SEQUENCE", w.sequence, w.vehicle);
          feature.attributes.Sequence = w.sequence+1;
          feature.attributes.RouteName = "VEH:"+w.vehicle;
          feature.attributes.AssignmentRule = 2;
        } 
        // if(w._type === "Outage") {
        //   feature.attributes.Sequence = 1;
        // }
      
        stops.features.push(feature);
    } 
	route.stops =stops;
	return route;
};

Route.prototype.sha1 = function() {  
  var sha_me = _.pick(this, 'orders', 'depots', 'routes', 'default_date');
  // console.log("SHA ME>>>>>", sha_me.orders.features.length);
  return hash(sha_me);
};

Route.get_by_job_id = function *(job_id) {
  var data  = yield fs.readFile('/tmp/esri_job_'+job_id, {'encoding': 'utf8'});
  data = JSON.parse(data);
  var r = new Route();
  _.extend(r, data);
  return r;
};

Route.prototype.load_by_sha1 = function *() {
  var sha1 =this.sha1();
  var data = null;
  try {
    data  = yield fs.readFile('/tmp/esri_sha1_'+sha1  , {'encoding': 'utf8'});
  } catch(e) {
    log.warn('could not read file', '/tmp/esri_sha1_'+sha1);
  }
  if(data) {
    log.info("ESRI Cache Hit", sha1);
    data = JSON.parse(data);
    _.extend(this, data);
  }
  return this;
};

Route.load_by_sha1 = function *(sha1) {
  var data = null;
  try {
    data  = yield fs.readFile('/tmp/esri_sha1_'+sha1  , {'encoding': 'utf8'});
  } catch(e) {
    log.error('could not read file', '/tmp/esri_sha1_'+sha1, e);
  }
  var route = new Route();
  if(data) {
    // console.info("ESRI Cache Hit");
    data = JSON.parse(data);
    _.extend(route, data);
  }
  return route;
};

Route.prototype.save = function *() {
  // console.log("trying to save this", this);
  //TODO - change this to generator?
  // console.log("SAVING");
  // console.log(this.sha1());
  var sha1 = this.sha1();
  var str_data = JSON.stringify(this);
  if(this.job_id) {
    yield fs.writeFile('/tmp/esri_job_'+this.job_id, str_data, {'encoding': 'utf8'});
  }
  // console.log('saving', '/tmp/esri_sha1_'+sha1);
  yield fs.writeFile('/tmp/esri_sha1_'+sha1, str_data, {'encoding': 'utf8'});
};


Route.STATUS_NOT_REQUESTED = 'NO_REQ';
Route.STATUS_REQUEST_FAILED = 'REQ_FAIL';
Route.STATUS_WAITING = 'WAITING';
Route.STATUS_READY =   'READY';
Route.STATUS_LOADED =  'LOADED';


Route.TYPE_ROUTE =     'ROUTE';
Route.TYPE_MAGNITUDE = 'MAGNITUDE';

module.exports = Route;
