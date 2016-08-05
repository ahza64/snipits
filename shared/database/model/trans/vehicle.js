/**
    Models define a Schema will add a will define add that model to the mongoose db connection
*/
var mongoose = require('mongoose');
var connection = require('dsp_database/connections')('trans');
var vehicleSchema = new mongoose.Schema({
    name: String,
    status: {type: String, enum: ['available', 'in_transit', 'working'], default: "available"},
    work_order: {type: mongoose.Schema.ObjectId, ref: 'WorkOrder'},
    type: String,
    size: {width: Number, length: Number},
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
    queued: { type: Date, default: Date.now },
    patch: {type: mongoose.Schema.ObjectId, ref: 'Patch'},
    tenant: {type: mongoose.Schema.ObjectId, ref: 'Tenant'},
    location: {type: {}, index: '2dsphere', validate: [locationInNorthAmerica, "{PATH} not in North America"] },
    simulate_location: {type: Boolean, default: false},
    simulate_work: {type: Boolean, default: false},
    route_config: {},
    started : {type: Boolean, default: false},
    start_time: { type: Date, default: null },
    stop_time: { type: Date, default: null },
    pulse: { type: Date, default: null },
    work_types: {type: [String], default: null},
    language: {type: String, default: 'en'},
    user: {type: mongoose.Schema.ObjectId, ref: 'User', default: null},
    treeCount: {}
});

function locationInNorthAmerica(loc) {
  //Coordinates for a very rough bounding box
  var x_min = -125.0011200905;
  var x_max = -66.5880279541;
  var y_min = 24.9122318354;
  var y_max = 49.119566634;

  // console.log("VALIDATING VEH LOCATION", loc,
  //       !loc || loc.coordinates[0] >= x_min &&
  //         loc.coordinates[0] <= x_max &&
  //         loc.coordinates[1] >= y_min  &&
  //         loc.coordinates[1] <= y_max);

  return !loc || loc.coordinates[0] >= x_min &&
          loc.coordinates[0] <= x_max &&
          loc.coordinates[1] >= y_min  &&
          loc.coordinates[1] <= y_max;
}



var Vehicle = connection.model('Vehicle', vehicleSchema);


module.exports = Vehicle;


/** OLD API
id: 1,
guid: "b06383c5-5525-4276-a33f-2f31fd5c8e08",

+ status: "green",.....
+ size: null,
+ address: "None, None, None, None",
+ latitude: "37.7789637000",
+ longitude: "-122.4176544600",
+ type: "fleet",


*/
