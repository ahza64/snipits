#!/usr/bin/env node
const migrate_util = require('dsp_migrate/util');
var utils = require('dsp_shared/lib/cmd_utils');
utils.connect(['meteor', 'trans']);


// const assert = require('assert');
const _ = require('underscore');
const Tree = require('dsp_shared/database/model/tree');
const Cuf = require('dsp_shared/database/model/cufs');
const TransUser = require('dsp_shared/database/model/trans/user');
const TransVehicle = require('dsp_shared/database/model/trans/vehicle');

var migrate_schmea = {
  _id: "vehicle",
  vehicle: "vehicle",
  name: function(user) {
    return user.first_name+user.last_name;
  },
  first:"first_name",
  last:"last_name",
  user:"_id",
  uniq_id:"email",
  scuf: "supervisor_email",
  status: function(){ return "deleted";},
  work_type: function*(tree) {
    var veh = yield TransVehicle.findOne({_id: tree.vehicle});
    console.log("GOT VEH", veh.work_types);
    return veh.work_types;
  }
};


function *run(type, fix) {
  var types = type || ["pi_user_id", "tc_user_id"];
  if(!Array.isArray(types)) {
    types = type.split(',');
  }
  for(var t = 0; t < types.length; t++) {
    type = types[t];
  
    var query =  {};
    query[type] = {$ne: null};
  
    var ids = yield Tree.distinct(type, query);
    var existing = yield Cuf.distinct("_id");
    var count = 0; 

    existing = _.indexBy(existing, id => id.toString());
    for(var i = 0; i < ids.length; i++) {
      var id = ids[i].toString();
      if(!existing[id]) {
        count++;
      
        console.log('existing not found', id, fix);
        if(fix) {
          var cuf = yield Cuf.findOne({user: id});
          var user = yield TransUser.findOne({vehicle: id});
          
          if(cuf) {
            query = {};
            query[type] = id; 
            
            var update = {};            
            update[type] = cuf._id;
            yield Tree.update(query, {$set: update}, {multi: true});
          } else if(user) {                
            var new_cuf = yield migrate_util.applyMigrationSchema(migrate_schmea, user);        
            yield Cuf.create(new_cuf);
          } else {
            console.error("Could not user", id);
          }
        }
      }
    }
  }
  return count;
}




function *check(type) {
  var count = yield run(type);
  if(count) {
    process.exit(1);
    return false;
  }
  return true;
}

//baker module
if (require.main === module) {
  utils.bakerGen(run, { default: true }); 
  utils.bakerGen(check); 
  utils.bakerRun();  
}
