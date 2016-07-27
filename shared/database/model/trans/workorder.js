var mongoose = require('mongoose');
var connection = require('dsp_database/connections')('trans');
var schemaData = {
    name: String, 
    span_name: String, 
    description: String,
    location: {type: {}, index: '2dsphere'},	
    progress: {type: Number, default: 0}, //% complete
    estimated_time: Number, //estimated time to repair in seconds
    start_time: { type: Date, default: null},
    complete_time: { type: Date, default: null},
    work_type: { type: String, enum: ['tree_inspect', 'circuit_inspect', 'tree_trim'] },
    status: {type: String, enum: ['unassigned', 'assigned', 'in_transit', 
                                  'in_progress', 'complete', 'deleted', "invalid", "suspended"], default: "unassigned"},
    damage_type: {type: String, enum: ['unknown', 'damage']}, //TODO: fill in more damage types
    priority: {type: String, enum: ["immediate", "accelerate", "routine"], default: "routine"},

    // should remove these maybe they should go into outage
    directly_effected_customers: Number, 
    indirectly_effected_customers: Number,   

    resource_id: Number, //related resource id in external system  (i.e. GIS System) 
    group_id: Number, //Number used to pre group workorders into plannable sets     
    parent_id: {type: mongoose.Schema.ObjectId, ref: 'WorkOrder'}, // link workorders together
    pge_pmd_num: {type: String},

    created: { type: Date, default: Date.now, index: true },
    updated: { type: Date, default: Date.now, index: true },
    queued: { type: Date, default: Date.now },

    outage: {type: mongoose.Schema.ObjectId, ref: 'Outage'}, 
    tasks: [], //list of tasks
    results: [], //list of data collected for each task in the workorder.
    tenant: {type: mongoose.Schema.ObjectId, ref: 'Tenant'},
    grid: {type: mongoose.Schema.ObjectId, ref: 'Grid'},
    vehicle: {type: mongoose.Schema.ObjectId, ref: 'Vehicle'},
    sequence: {type: Number}, //used in esri routing but doesn't work great.
    _type: { type: String, default: "WorkOrder", required: true, select: true, index: true}
};


var workorderSchema = new mongoose.Schema(schemaData, { collection: 'planables' });
var WorkOrder = connection.model('WorkOrder', workorderSchema);

module.exports = WorkOrder;