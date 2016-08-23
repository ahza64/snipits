/**
    Models define a Schema will add a will define add that model to the mongoose db connection

    grids represent power transmission infrastructure
    create a workorder and associate it with an outage. 
*/
//console.log(require("../app.js"))


var mongoose = require('mongoose');
var connection = require('dsp_database/connections')('trans');



var schmea = new mongoose.Schema({
    name: { type: String }, 
    description: String,    
    division: String,      
    group: String,      
    line_number: String,        
    location: {type: {}, index: '2dsphere'},	
    conductors: [],
    towers: [],
    feature_layers: {},
    tenant: {type: mongoose.Schema.ObjectId, ref: 'Tenant'},
    inspect_tenant: {type: mongoose.Schema.ObjectId, ref: 'Tenant'},
    trim_tenant: {type: mongoose.Schema.ObjectId, ref: 'Tenant'},
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now }    
});

var Grid = connection.model('Grid', schmea);

module.exports = Grid;
