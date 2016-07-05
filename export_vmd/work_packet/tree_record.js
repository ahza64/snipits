/**
 * @fileoverview This is a tree record xml object for pge vmd export
 */
var _ = require("underscore");
var assert = require('assert');
var js2xmlparser = require("js2xmlparser");

var Restriction = require('./restriction');
var Alert = require('./alert');
var JPGImage = require('./jpg_file.js');
var TreeStates = require('tree-status-codes');
var GPS = require("./gps");
var vmd = require("dsp_shared/lib/pge_vmd_codes");
require("sugar");

/*
*   SYSTEM TESTS:
*     Missing trimcodes
*     All trimcodes will map to a vmd trimcode (currently i just didn't export these)
*     All active Users have companies that map to vmd codes 
*     Warnings when states are inconsistant
*       i.e. READY BUT MISSING NTW 
*     All projects are integers
*     All lines map to a line in vmd 
*     Lines need voltage, division, and type(dist/trans)
*     All trees need counties, city, etc
*     
* 
*   NOTES:
*     Exports are hard coded with sAcctType === M for mantainance 
*         (Be aware that this will have to change if we export orchard trees)
*     iTreeSort: Needs to be added when this record is added to a location
*     sInspComp: need to get all the companies for users
*     dtNextTrimDate: I could use PMD planned complete dates
*     Need to ingest gps flight/aquisition date
* 
*
* 
* 
*   Questions: 
*     Can I use the P (phone) notification for our "notify customer flag"
* 
* 
*   Email Sent to Mike Morely:
*     sCrewType: What are the values : LA AND CA are the most common
*     sWorkType: What are the values : Not used for a long time
*     sTreeRecsStatus: Need to confirm logic for this one : notes in vmd codes
*     dtInspDate: date format?
* 
*     dont' know what these are:
*       dTGR
*       sMWSDocNum
*       sMWS
* 
*   Do we have an example of QSI having more than one Record per Location?
*/

/* jshint maxlen: 180 */
var root_node = "TreeRecs"; 
var TREE_RECORD = {     // <TreeRecs>
  sTreeCode: null,        // <sTreeCode>          char(4)		    	[NULL] or user selected from list below (tree type)
  sNotification: null,    // <sNotification>      char(1)         *[N],O,C,H,R,Q
  nDBH: null,             // <nDBH>               numeric(2, 0)   [NULL] or prescribed by CUF
  nHeight: null,          // <nHeight>            numeric(3, 0)   Height in feet, rounded to integer value
  nClearance: null,       // <nClearance>         numeric(2, 0)   [NULL] or prescribed by CUF
  nQty: 1,                // <nQty>               numeric(5, 2)   [1] if listing single units of trees, or total quantity of trees of similar species/dbh/height
  sTrimCode: null,        // <sTrimCode>          char(3)         [NULL] or user selected from list below
  sPCode: null,           // <sPCode>             char(1)         [R]Routine, N(No Trim),H(HN-Imd),U(HN-Urg),X(Accelerate),I(Immediate) 
                          //                                            - Can we setup proximity rules to select priority  
  sNextTrim: 1,           // <sNextTrim>          char(1)         [1],2,3 - Number of years until next inspection  
  sCrewType: null,        // <sCrewType>          char(2)         [NULL]
  sWorkType: null,        // <sWorkType>          char(1)         [NULL]
  sComment: null,         // <sComment>           char(45)        [NULL] or user entered
  bUnderBuild: 0,         // <bUnderBuild>        bit             *[0] Not sure if we can determine if there is underbuild
  bTreeConn: 0,           // <bTreeConn>          bit             *[0]
  bTreeWire: 0,           // <bTreeWire>          bit             *[0]
  bInsfClear: 0,          // <bInsfClear>         bit             *[0]
  sAcctType: null,         // <sAcctType>          char(1)         [W], M, Y, Z or from list below
  bNotifyPhon: 0,         // <bNotifyPhon>        bit             *[0] or user entered
  bNotifyPers: 0,         // <bNotifyPers>        bit             *[0] or user entered
  bNotifyDoor: 1,         // <bNotifyDoor>        bit             *[1] or user entered
  bNotifyPerm: 0,         // <bNotifyPerm>        bit             *[0] or user entered
  iTreeSort: null,        // <iTreeSort>          tinyint         *Tree number, Integer increasing from 1,2,3,...,255
  dtInspDate: null,       // <dtInspDate>         datetime        *Date of inspection/flyover  
  dtNextTrimDate: null,   // <dtNextTrimDate>     datetime        [Default to one year from inspection date]  
  sInsp: null,            // <sInsp>              char(4)         [inspector id] or [sysa] if unknown inspector
  sInspComp: null,        // <sInspComp>          char(3)         *[PGE] or value from inspection company list below
  bVELBArea: null,        // <bVELBArea>          bit             [0]
  ExternalTreeID: null,   // <ExternalTreeID>     varchar(50)     Unique identifier of tree from external source system
  sTreeRecsStatus: null,  // <sTreeRecsStatus>    char(10)        [OPEN] or value from list below  
  nWireType: 0,           // <nWireType>          tinyint         [NULL]
  
  //omiting thes optional values
  // nManHours: null,         // <nManHours>          numeric(5, 2)   [NULL]
  // sPoleOwner: P,           // <sPoleOwner>         char(1)         [P]
  // sOwnedBy: null,          // <sOwnedBy>           char(2)         [NULL] or landowner value entered by user from list below
  // sReason: null,           // <sReason>            char(2)         [NULL]
  // sWorkReq: null,          // <sWorkReq>           char(11)        [NULL]
  // iWRTreeRecsID: null,     // <iWRTreeRecsID>      int             [NULL]
  // sWrkRptNum: null,        // <sWrkRptNum>         char(7)         [NULL]
  // sPerformCont: null,      // <sPerformCont>       char(7)         [NULL]
  // dTGR: null,              // <dTGR>               datetime        [NULL]
  // sMWSDocNum: null,        // <sMWSDocNum>         char(6)         [NULL]
  // sMWS: "N",               // <sMWS>               char(1)         [N] - Not a MWS
  // nProximity: null,        // <nProximity>         tinyint         [NULL] or lateral distance in ft. to line
  // dtTGRPriorLast: null,    // <dtTGRPriorLast>     datetime        [NULL]
  // dtTrimPriorLast: null,   // <dtTrimPriorLast>    datetime        [NULL]

  // dtVisitedDate: null,     // <dtVisitedDate>      datetime        Inspection Date
  // sLineID2: null,          // <sLineID2>           char(6)         Secondary Line
  // sMWSUserID: null,        // <sMWSUserID>         char(50)        [NULL]
  // dtMWSSignedDate: null,   // <dtMWSSignedDate>    datetime        [NULL]
  // sRxComments: null,       // <sRxComments>        char(255)       [NULL] or user entered value
  // bMWS: 0,                 // <bMWS>               bit             [0]
  // bJointPole: 0,           // <bJointPole>         bit             [0]
  // sJointPoleUtility: null, // <sJointPoleUtility>  char(60)        [NULL]

}; //</TreeRecs>


/**
 * @description Tree Record Constructor
 * @param {Object} tree - tree resoruce from mongo db
 * @param {Object} inspector - inspector user object (cuf)
 * @param {Object} line - grid/circuit/line object 
 * @param {Object} pmd - PMD project object
 */
var TreeRecord = function(tree, inspector, line, pmd, image){
  this.tree = tree;
  this.inspector = inspector;
  this.line = line || {};
  this.project = pmd;
  
  if(tree.image && !image) {
    console.error("TREE IMAGE MISSING: "+ tree.image+" on tree: "+ tree._id);
  }
  
  this.statusFlags = TreeStates.fetchStatusFlags(tree.status);
  this.tree.inspector = inspector.uniq_id +" : "+inspector.first+" "+inspector.last;
  this.tree.inspector_company = inspector.company;

  this.tree.line_voltage = this.line.voltage;
  this.tree.line_number = this.line.line_number;
  this.tree.line_type = this.line.type || 'transmission';
  this.tree.vmd_circuit_num = this.project.vmd_circuit_num;


  this.tree.pmd_name = pmd.name;
    
  this.record = _.extend({}, TREE_RECORD);
  
  this.tree.species = this.tree.species || "unknown";
  this.record.sTreeCode = vmd.tree_types[tree.species];
  this.record.sNotification = this.getNotificationType();
  this.record.nDBH = tree.dbh;
  this.record.nHeight = Math.round(tree.height);
  this.record.nClearance = Math.min(99, tree.clearance);
  this.record.sTrimCode = vmd.trim_codes[tree.trim_code];
  this.record.sPCode = this.getPriorityCode();
  this.record.sComment = tree.comment || null;
  this.record.dtInspDate = this.formatDate(tree.pi_complete_time); 
  this.record.sLineID2 = this.tree.line_number;
  
  
  if(tree.pi_complete_time) {
    this.record.dtNextTrimDate = this.formatDate(Date.create(tree.pi_complete_time).addYears(1));
    this.record.dtNextTrimDate = JSON.parse(JSON.stringify(this.record.dtNextTrimDate));        
  } 
  this.record.sInsp = tree.inspector;
  this.record.sInspComp = vmd.company_codes[tree.inspector_company];  
  this.record.bVELBArea = this.statusFlags.environment === "velb" ? 1 : 0;  
  this.record.ExternalTreeID = tree.qsi_id || tree._id.toString();
  this.record.sTreeRecsStatus = this.getTreeRecordStatus();
  
  // We are curretly only exporting trees as Maintenance (
  // TODO: Update sAcctType if we ever export Orchard trees
  // if(pmd.type.startsWith("Orchard")) {
  this.record.sAcctType = vmd.account_types.Maintenance;


  var gps = new GPS("TreeRec", tree.location.coordinates[1], tree.location.coordinates[0], tree.gps_acq_date);
  this.record[gps.root_node] = gps.getData();
  
  this.record.sCrewType = vmd.crew_type[this.statusFlags.vehicle_type||"climb"];  
  Restriction.createTreeRestricitons(this);
  Restriction.checkNotifications(this);  
  Alert.createTreeAlerts(this);
  
  if(image) {
    var jpg = new JPGImage(image);
    this.record.TreeRecsFile = [jpg.getData()];
  }

  this.validateRequired();
};

TreeRecord.prototype.validateRequired = function() {
  
  this._testValue("sInspComp", _.values(vmd.company_codes));
  this._testValue("species", _.keys(vmd.tree_types));  
  this._testValue("sTreeCode", _.values(vmd.tree_types));  
  assert(!this.get("nClearance") || this.get("nClearance") < 100, "nClearance is to large. "+this.get("nClearance"));
};

TreeRecord.prototype._testValue = function(key, acceptible) {
  assert(_.contains(acceptible, this.get(key)), "Bad "+key+ " in tree "+this.tree._id+" : "+this.get(key));
};


TreeRecord.prototype.addRestriction = function(restrict) {
  this.restrictions = this.restrictions || [];
  this.restrictions.push(restrict);
  this.record.TreeRecsRestrictions = this.record.TreeLocRestrictions || [];
  this.record.TreeRecsRestrictions.push(restrict.getData());
};

TreeRecord.prototype.addAlert = function(alert) {
  this.alerts = this.alerts || [];
  this.alerts.push(alert);
  this.record.TreeRecsAlerts = this.record.TreeRecsAlerts || [];
  this.record.TreeRecsAlerts.push(alert.getData());
};


TreeRecord.prototype.getLocation = function() {
  return this.tree.location;
};

TreeRecord.prototype.getStatus = function() {
  return this.statusFlags.status;
};

TreeRecord.prototype.hasRestrictions = function(){
  if(this.statusFlags.refused) {
    return true;
  }
  if(this.statusFlags.environment) {
    return true;
  }
  
  return false;
};

TreeRecord.prototype.getTreeRecordStatus = function() {
  var status = this.statusFlags.status;
  
  var has_issues = this.getNotificationIssue() !== null;
  
  var record_status;
  if(has_issues) {
    record_status = {
        "left":       "open",
        "ready":      "tree_ok",
        "worked":     "tree_ok",      
        "no_trim":    "no_work_with_issues",
        "not_ready":  "contact_with_issues"
    }[status];
  } else {
    record_status = {
        "left":       "open",
        "ready":      "tree_ok",
        "worked":     "tree_ok",
        "no_trim":   "no_work_no_issues",
        "not_ready":  "contact_no_issues"
    }[status];    
  }

  if(record_status === "tree_ok") {
    assert(this.record.sNotification === "O", "BAD record status / notification combo "+this.tree._id);
    assert(!this.restrictions);
  } else if(record_status === "contact_no_issues" || record_status === "contact_with_issues") {
    assert(_.contains(["C", "Q", "R"], this.record.sNotification));
  } else if(record_status === "no_work_no_issues" || record_status === "no_work_with_issues") {
    assert(this.record.sNotification === "N");
  }
    
  return vmd.tree_record_status[record_status];
};

TreeRecord.prototype.getNotificationIssue = function() {
  var statusFlags = this.statusFlags;
  var tree = this.tree;
  
  var notification = null;
  if(statusFlags.refused) {
    notification = "refusal"; //some kind of refusal (override if more specific)
  } else if(statusFlags.ntw_needed && !tree.ntw_image) {
    notification = "contact";
  } else if(statusFlags.environment) {
    notification = "quarantine";
  }
  return notification;
};

TreeRecord.prototype.getNotificationType = function() {
  // contact          Unsigned NTW
  // hold
  // left_card
  // inventory        No tree work needed
  // ok (OK to work)  Tree trim/removal complete OR Signed NTW
  // phone
  // quarantine       Bird's nest, riparian zone, or other environmental review needed
  // refusal          Customer refusal
  var statusFlags = this.statusFlags;
  var tree = this.tree;
  
  if(statusFlags.status === "no_trim") {
    notification = "inventory"; 
  } else {
    var notification = null;
    if(statusFlags.status === "ready" || statusFlags.status === "worked"){
      notification = "ok";
    } else {
      var issue = this.getNotificationIssue();
      if(issue) {
        notification = issue;
      } else if(statusFlags.status === "not_ready") {
        notification = "contact";
      }
    }
  }
  assert(vmd.notification_codes[notification], "missing notification code: "+ tree._id);
  return vmd.notification_codes[notification];
};

TreeRecord.prototype.getPriorityCode = function() {
  var statusFlags = this.statusFlags;
  var tree = this.tree;
  
  var priority = statusFlags.priority;
  
  if(statusFlags.status === "no_trim") {
    priority = "no_trim";
  }
  
  assert(vmd.priority_codes[priority], "missing priority code", tree._id);
  return vmd.priority_codes[priority];  
};

TreeRecord.prototype.toXML = function() {
  return js2xmlparser(root_node, this.record);
};


TreeRecord.prototype.set = function(key, value){
  this.record[key] = value;
};

TreeRecord.prototype.getData = function(){
  return this.record;
};


TreeRecord.prototype.get = function(key) {
  if(this.record[key] === undefined) {
    return this.tree[key];
  }
  return this.record[key];
};

TreeRecord.prototype.formatDate = function(date) {
  // From Mike Morely:
  // The time needs to represent the local time that the inspector was at the location.   P
  // lease use this format mm/dd/yyyy hh:ss              in 24 hr format for PST/PDT time zone.    For example, 06/10/2016 14:23
  // My understanding is that you are capturing time in ZULU time, which means you will have to shift either -7 or -8 hrs depending on local daylight savings time.
  //
  // The above was recanted and the standard JSON time string was accepted without error.
  
  
  if(date) {
    if(_.isString(date)) {
      date = new Date.create(date);
    } 
    return JSON.parse(JSON.stringify(date));
  } 
  return null;
};


module.exports = TreeRecord;
