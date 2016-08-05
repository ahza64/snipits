/**
    Models define a Schema will add a will define add that model to the mongoose db connection
*/
var mongoose = require('mongoose');
var connection = require('dsp_database/connections')('trans');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    first_name: String,
    last_name: String,
    email: { type: String, required: true, index: { unique: true }},
    phone_number: {type: String, default: null},
    password: { type: String, required: true, select: false },
    service_area: {type: {}, index: '2dsphere'},//not sure if we want this...
    tenant: {type: Schema.ObjectId, ref: 'Tenant'},
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
    vehicle: {type: mongoose.Schema.ObjectId, ref: 'Vehicle', unique: true, sparse: true },
    status: {type: String },
    supervisor: {type: Schema.ObjectId, ref: 'User'},
    supervisor_email: {type: String },
    _host: {type: String}, //used by system to make host write once
    host: {type: String },
    checksum: {type: {}, default: {} },
    pulse: {type: Date, default: null},
    lastLogin:  {type: Date, default: null}
});


var User = connection.model('User', UserSchema);

module.exports = User;