var vmd = require('./pge_vmd_codes');
var _ = require('underscore');
var log = require('log4js').getLogger('['+__filename+']');
var assert = require('assert');


var ROLE_PRIVATE_INSPECTOR = "PI";
var TREES_INC_COMPANY_ID = vmd.inspection_companies["Trees Inc."];
var ROLE_PRIVATE_INSPECTOR = "PI";
var ACRT_INSPECT_COMPANY = vmd.inspection_companies.ACRT;

assert(ACRT_INSPECT_COMPANY);

var tree_row = {
  LATITUDE: null,
  LONGITUDE: null,
  X: null, //longitude
  Y: null, //latitude
  Z: null,    
  PRIORITY: null,  
  REGION: null,  //PGE Devision
  DIVISION_ID: null, //PGE Devision    
  TREE_COMMENTS: "",
  ROLE_TYPE: ROLE_PRIVATE_INSPECTOR,  
  INSPECTOR_COMPANY: ACRT_INSPECT_COMPANY,  
  INSPECT_DATE: null,  
  
  //derived
  CUSTOMER_NOTIFICATION_ID: null, //derive from on NTWs, refusals, environmental reviews, and work completion
  ALERT_ID: null,
  
  //in system
  TRIM_CODE: null, 
  INSPECT_WO_NUMBER: null,
  TRIM_WO_NUMBER: null,

  // Need to get from gis data
  SPAN_NBR: null,
  TREEID: null, //qsi tree ids (or dispatchr)
  LINE_NAME: null,
  LINE_NBR: null,

  TREE_TYPE: null,

  //need reverse geocode
  STREET_NUM: null,
  STREET: null,
  CITY_ID: null,
  COUNTY_ID: null,
  
  //wating for qsi
  // ACCOUNT: null,
  // HEALTH: null,
  // TAG_TYPE: null,
  // DBH: null,
  // SOURCE_DEVICE: null,
  // PROPERTY_OWNER_TYPE_ID: null,
  // SSD_ROUTE: null,
  // ROUTE_NUMBER: null,

  //qsi to derive  
  // TREE_STATUS: null,
  // HEIGHT: null,
  // IS_SRA: null,
  // TREE_RECORD_STATUS: null,
  
  DISPATCHR_ID: null,
  UPDATE: false
};

var Grid = require('dsp_model/grid');
var PMD = require('dsp_model/pmd');
var grids = yield Grid.model.find().exec();
var pmds = yield PMD.model.find().exec();  


function transform(tree) {
  
  var row = _.extend({}, tree_row);
  var grid = grids[tree.circut_name];
  
  
  row.DISPATCHR_ID = tree._id.toString();

  var division = grid.division;
  var pmd = pmds[tree.pge_pmd_num];
  if(tree.pge_pmd_num && pmds[tree.pge_pmd_num]) {
    division = pmds[tree.pge_pmd_num].division;
  }

  if(!vmd.division_codes[division]) {
    if(pmd){
      log.error("no division for tree/pmd ",tree.status, tree.priority,pmd.name, pmd.pge_pmd_num, division, tree.pge_pmd_num);  
    } else {
      log.error("no division for tree/grid ", tree.status, tree.priority, grid.name, grid.line_number,division);
    }
  }
  row.DIVISION_ID = vmd.division_codes[division];
  row.REGION = vmd.division_codes[division];

  if(!vmd.priority_codes[tree.priority]) {
    log.error("Bad Tree Priority", tree._id, tree.priority);
  }
  // assert(vmd.priority_codes[tree.priority], "no priority for tree "+tree._id+" "+tree.priority);
  if(tree.priority === "immediate") {
    tree.priority = "accelerate";
  }
  assert(tree.priority !== "immediate", "We have a tree marked immediate: "+ tree._id);
  row.PRIORITY = vmd.priority_codes[tree.priority];          
        
  row.LONGITUDE = tree.location.coordinates[0];
  row.LATITUDE = tree.location.coordinates[1];
  row.X = tree.location.coordinates[0];
  row.Y = tree.location.coordinates[1];

  // assert(tree.complete_time, "no complete time for tree");

  if((tree.status === "ready" || tree.status === "newTree") && !tree.complete_time) {
    log.warn("Tree has no complete time", grid.name, tree._id);
    tree.complete_time = tree.updated;
  }

  if(tree.complete_time) {
    row.INSPECT_DATE = tree.complete_time;
  }
  row.INSPECT_DATE = JSON.parse(JSON.stringify(tree.complete_time));

  row.TREE_TYPE = vmd.tree_types[tree.species];
  row.TRIM_CODE = trimCode(tree, grid);
  
  row.INSPECT_WO_NUMBER = tree.inspector_wo;
  row.TRIM_WO_NUMBER = null;
  if(tree.trimmer_status === "complete") {
    row.TRIM_WO_NUMBER = tree.trimmer_wo;
  }

  row.CUSTOMER_NOTIFICATION_ID = getNotificationType(tree);          
  row.ALERT_ID = alertStatus(tree);


  row.SPAN_NBR = tree.qsi_span_number || null;
  row.TREEID = tree.qsi_tree_id || tree._id;
  row.LINE_NAME = grid.name;
  row.LINE_NBR = grid.line_number;

  return row;
}



//properties
//     "notify_customer": true,
//     "access_issue": true,
//     "refused": true,
//     "ntw_needed": true,
//     "ntw_signed": fase,
//     "dog": true,
//     "environment": true,
//     "irate_customer": true,
//     "access_code": true,
//     "access_code_value": "sdfsdf"
function getNotificationType(tree) {
  // contact          Unsigned NTW
  // hold
  // left_card
  // inventory        No tree work needed
  // ok (OK to work)  Tree trim/removal complete OR Signed NTW
  // phone
  // quarantine       Bird's nest, riparian zone, or other environmental review needed
  // refusal          Customer refusal
  
  if(tree.priority === "allgood") {
    notification = "inventory"; 
  } else {
    var notification = "ok";
    if(tree.refused) {
      notification = "refusal"; //some kind of refusal (override if more specific)
    } else if(tree.properties.ntw_needed) {
      notification = "contact";
    } else if(tree.properties.environment) {
      notification = "quarantine";
    } else if(tree.notify_customer) {
      notification = "phone";
    }
  }
  assert(vmd.notification_codes[notification], "missing notification code", tree._id);
  return vmd.notification_codes[notification];
}

/*
  looks through the tree task and find a trimcode
*/
function trimCode(tree, grid) {
  var trim_code = null;
  tree.tasks = tree.tasks || [];
  
  
  for(var k  = 0; k < tree.tasks.length; k++) {
    var new_trim = tree.tasks[k].trim;
    if(!(trim_code === new_trim || !trim_code || !new_trim)){
      log.error("More than one trim code", tree._id, new_trim, trim_code);
    } 
    trim_code = trim_code || new_trim;
    // assert(trim_code === new_trim || !trim_code || !new_trim, "GOT more than one trimcode");
  }
  if(!trim_code && tree.priority !== "allgood" && tree.status && !tree.refused) {
    log.error("No Trim Code", grid.name, tree._id, tree.status, tree.priority, trim_code);
  }
  if(trim_code) {
    assert(vmd.trim_codes[trim_code], "Could not lookup Trimcode: "+ trim_code+" "+tree._id);
    trim_code = vmd.trim_codes[trim_code];
  }
  return trim_code;
}





function alertStatus(tree) {
  // "concerned customer" //threat  
  // "riparian" //repairian zone
  // "access" //access issues
  // "other hazard"
  var alert_type = null;


  if(tree.properties.irate_customer) {
    alert_type = "concerned customer";
  } else if(tree.properties.environment) {
    alert_type = "riparian";
  } else if(tree.properties.access_issue) {
    alert_type = "access";
  } else if(_.contains(tree.warnings, "hazard")){
    alert_type = "other hazard";
  }

  if(alert_type) {
    assert(vmd.alert_codes[alert_type], "missing alert code: "+ alert_type);
    alert_type = vmd.alert_codes[alert_type];    
  }
  return alert_type;  
}

module.exports = transform;