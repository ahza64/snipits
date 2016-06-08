var vmd = require('../pge_vmd_codes');
var _ = require('underscore');
var log = require('log4js').getLogger('['+__filename+']');
var assert = require('assert');

const TreeStates = require('tree-status-codes');
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
  UPDATE: false,
  DBH: null
};

var Circuit = require('dsp_shared/database/model/circuit');
var PMD = require('dsp_shared/database/model/pmd');

var circuits;
var pmds;

function *init(){
  circuits = yield Circuit.find();
  pmds = yield PMD.find();  
  circuits = _.indexBy(circuits, 'name');
  pmds = _.indexBy(pmds, 'pge_pmd_num');  
}


function *getDivision(tree) {
  if( !circuits ) {
    yield init();
  }  
  var circuit = circuits[tree.circuit_name];
  var division = circuit.division;
  var pmd = pmds[tree.pge_pmd_num];
  
  if(tree.pge_pmd_num && pmds[tree.pge_pmd_num]) {
    division = pmds[tree.pge_pmd_num].division;
  }

  if(!vmd.division_codes[division]) {
    if(pmd){
      log.error("no division for tree/pmd ",
        tree.status, tree.priority,pmd.name, pmd.pge_pmd_num, division, tree.pge_pmd_num);  
    } else {
      log.error("no division for tree/circuit ", 
        tree.status, tree.priority, circuit.name, circuit.line_number,division);
    }
  }
  return division;
  
}

function *transform(tree) {
  if( !circuits ) {
    yield init();
  }  
  
  var row = _.extend({}, tree_row);
  var circuit = circuits[tree.circuit_name];
  row.DISPATCHR_ID = tree._id.toString();
  
  var division = yield getDivision(tree);
  row.DIVISION_ID = vmd.division_codes[division];
  row.REGION = vmd.division_codes[division];

  var statusFlags = TreeStates.fetchStatusFlags(tree.status);
  if(!vmd.priority_codes[statusFlags.priority]) {
    log.error("Bad Tree Priority", tree._id, statusFlags.priority);
  }
  assert(statusFlags.priority !== "immediate", "We have a tree marked immediate: "+ tree._id);
  if(statusFlags.priority === "immediate") {
    statusFlags.priority = "accelerate";
  }
  
  row.PRIORITY = vmd.priority_codes[statusFlags.priority];                  
  row.LONGITUDE = tree.location.coordinates[0];
  row.LATITUDE = tree.location.coordinates[1];
  row.X = tree.location.coordinates[0];
  row.Y = tree.location.coordinates[1];

  if(_.contains(["no_trim", "ready", "worked"], statusFlags.status) && !tree.pi_complete_time) {
    log.warn("Tree has no pi complete time", circuit.name, tree._id);
    tree.pi_complete_time = tree.updated;
  }  
  
  row.INSPECT_DATE = JSON.parse(JSON.stringify(tree.pi_complete_time));

  row.TREE_TYPE = vmd.tree_types[tree.species];
  row.TRIM_CODE = trimCode(tree, statusFlags, circuit);
  
  row.INSPECT_WO_NUMBER = tree.pi_workorder;
  row.TRIM_WO_NUMBER = null;
  if(statusFlags.status === "worked") {
    row.TRIM_WO_NUMBER = tree.tc_workorder;
  }

  row.CUSTOMER_NOTIFICATION_ID = getNotificationType(tree, statusFlags);
  row.ALERT_ID = alertStatus(tree, statusFlags);

  row.SPAN_NBR = tree.qsi_span_number || null;
  row.TREEID = tree.qsi_id || tree._id;
  row.LINE_NAME = circuit.name;
  row.LINE_NBR = circuit.line_number || null;

  row.STREET_NUM = tree.streetNumber || null;
  row.STREET = tree.streetName || null;  
  console.log("tree", tree.city);
  row.CITY_ID = vmd.city_codes[tree.city.toUpperCase()];
  if(tree.county) {
    row.COUNTY_ID = vmd.county_codes[tree.county.toUpperCase()];
  } else {
    row.COUNTY_ID = null;
  }
  
  assert(row.CITY_ID);
  assert(row.COUNTY_ID);  
  
  return row;
}

function getNotificationType(tree, statusFlags) {
  // contact          Unsigned NTW
  // hold
  // left_card
  // inventory        No tree work needed
  // ok (OK to work)  Tree trim/removal complete OR Signed NTW
  // phone
  // quarantine       Bird's nest, riparian zone, or other environmental review needed
  // refusal          Customer refusal
  
  if(statusFlags.status === "no_trim") {
    notification = "inventory"; 
  } else {
    var notification = "ok";
    if(statusFlags.refused) {
      notification = "refusal"; //some kind of refusal (override if more specific)
    } else if(statusFlags.ntw_needed && !tree.ntw_image) {
      notification = "contact";
    } else if(statusFlags.environment) {
      notification = "quarantine";
    } else if(statusFlags.notify_customer) {
      notification = "phone";
    }
  }
  assert(vmd.notification_codes[notification], "missing notification code", tree._id);
  return vmd.notification_codes[notification];
}

/*
  looks through the tree task and find a trimcode
*/
function trimCode(tree, statusFlags, circuit) {
  var trim_code = tree.trim_code;

  if(!trim_code && _.contains(["ready", "worked"], statusFlags.status)) {
    log.error("No Trim Code", circuit.name, tree._id, tree.status, tree.priority, trim_code);
  }
  if(trim_code) {
    assert(vmd.trim_codes[trim_code], "Could not lookup Trimcode: "+ trim_code+" "+tree._id);
    trim_code = vmd.trim_codes[trim_code];
  }
  return trim_code;
}


function envAlert(environment) {
  var alert_type;
  switch(environment){
    case 'riparian':
      alert_type = 'riparian';
      break;
    case 'velb':
      alert_type = "velb site";
      break;
    case 'raptor nest':
      alert_type = "endangered species";
      break;
    case 'other':        
      alert_type = "other hazard";
      break;
    default:
      alert_type = "other hazard";
      break;        
  }
  return alert_type;
}


function alertStatus(tree, statusFlags) {
  // "concerned customer" //threat  
  // "riparian" //repairian zone
  // "access" //access issues
  // "other hazard"
  var alert_type = null;


  if(statusFlags.irate_customer) {
    alert_type = "concerned customer";
  } else if(statusFlags.dog){
    alert_type = "dog";
  } else if(statusFlags.environment) {
    alert_type = envAlert(statusFlags.environment);
  } else if(statusFlags.access_issue) {
    alert_type = "access";
  } else if(statusFlags.notify_customer) {
    alert_type = "notify first";
  }

  if(alert_type) {
    assert(vmd.alert_codes[alert_type], "missing alert code: "+ alert_type);
    alert_type = vmd.alert_codes[alert_type];    
  }
  return alert_type;  
}

module.exports = transform;