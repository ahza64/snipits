/**
 @fileoverview PGE VMD TreeLocation creates vmd and xml values
*/
var _ = require("underscore");

var js2xmlparser = require("js2xmlparser");
var vmd = require("dsp_shared/lib/pge_vmd_codes");
var GPS = require("./gps");
var Restriction = require('./restriction');
var Alert = require('./alert');
var assert = require('assert');

/*
* 
*   NOTES:
*     sSourceDev: We are currently bringing in SPAN NAME but I don't know which pole would be closer
*     bSRA: Need to get data from public fire soruces SRA
*     
*     iSSDRoute and iRouteNum need to be calculated when they are added to a record
*     sPriVolt may not be the most "highest voltage" our trees are associated with the line that is the highest priority to the tree
* 
*     TODO: More then one tree per location
*     TODO: Throw errors if trees are have different locations
*     TODO: Throw errors if inspected by diffrent people
*     TODO: ExternalLocID - static workorder, is it okay to have have the same ExternalLocID in locations from different packets?
*     TODO: Final decision on sTagType (still defautled)
* 
*     NEED WORKORDER ID
* 
*   Sent Email:
*     sTagType: Defualted to D not sure how to decide on these
*     sTreeLocStatus: Not sure how to translate each of these
*/


var root_node = "TreeLoc"; 
/* jshint maxlen: 180 */
var TREE_LOCATION = { //<TreeLoc>
  iSSDRoute: null,      // <iSSDRoute>         int           *Default to 10
  iRouteNum: null,      // <iRouteNum>         int           *Increment locations by 10 starting at 10
  sDivCode: null,       // <sDivCode>          char(2)       *Valid DIV code below
  sCountyCode: null,    // <sCountyCode>       char(2)       *Valid County Code below
  sInspComp: null,      // <sInspComp>         char(3)       *[PGE] or select from list below
  sInsp: null,          // <sInsp>             char(4)       [SYSA] or userid of inspector
  sCircuit: null,       // <sCircuit>          char(10)      *Circuit from list below
  sLineID: null,        // <sLineID>           char(6)       Highest voltage Transmission Line on span
  sTagType: "D",        // <sTagType>          char(1)       *[D] or select from list below  //Mike Morely Email: (probably should not be the default.  Josh is researching if 
                                                                                             //                   we want to add a new default tag type (with a blank value).
  sStreetNum: null,     // <sStreetNum>        char(11)      *Use APN street number or [0]
  sStreet: null,        // <sStreet>           char(26)      *Use APN street name or [NO ROAD]
  sCity: null,          // <sCity>             char(11)      *First 11 char of city, or nearest city if in unicorporated county territory
  iCityID: null,        // <iCityID>           int           From city list below    
  sComments: null,      // <sComments>         char(255)     [NULL]
  bCommAlert: 0,        // <bCommAlert>        bit           *[0]
  dtInspDate: null,     // <dtInspDate>        datetime      Inspection Date (flyover date)
  sAcctType: null,       // <sAcctType>         char(1)       [W], R, Y, Z or from list below


  sSourceDev: null,     // <sSourceDev>        char(8)       *Use Tower ID xxx/xxx
  sPoleNum: null,       // <sPoleNum>          char(9)       Tower Number or [NULL]
  sPoleNum2: null,      // <sPoleNum2>         char(9)       [NULL] or Next Tower Number in span (xxx/xxx)  
  sPriVolt: null,       // <sPriVolt>          char(3)       Highest Line voltage on span or [NULL] if unknown  

  sCustName: null,      // <sCustName>         char(15)      Customer Name from APN or [NULL]
  sCustPhone: null,     // <sCustPhone>        char(12)      Customer Phone from APN or [NULL]
  bCustAtLoc: 0,        // <bCustAtLoc>        bit           *[0]

  sTreeLocStatus: null,  // <sTreeLocStatus>    char(10)      [CMP_WK_NR], or value from list below
  ExternalLocID: null,   // <ExternalLocID>     varchar(50)   Unique identifier of location from external source system
  
  bSRA: null,           // <bSRA>              bit           *SRA = 1 if state/federal fire responsibility area, else 0 for LRA
  sArea: null,           // <sArea>             char(10)      [NULL]
    
  //omiting thes optional values
  // sQuadMap: null,        // <sQuadMap>          char(11)      [NULL]
  // sMapType: null,        // <sMapType>          char(1)       [NULL]
  // sMapTypeNum: null,     // <sMapTypeNum>       char(8)       [NULL]
  // sTagNum: null,         // <sTagNum>           char(10)      [NULL]
  // sDirections: null,     // <sDirections>                     [NULL]
  // sRACode1: null,        // <sRACode1>                        [NULL] or select from list below
  // sRACode2: null,        // <sRACode2>          char(2)       [NULL] or select from list below
  // sSConst: null,         // <sSConst>           char(1)       [NULL]
  // sPCC: null,            // <sPCC>              char(6)       [NULL]       //Mike Morely Email: Not used
  // sMisc: null,           // <sMisc>             char(5)       [NULL]       //Mike Morely Email: Used by back-end reporting to 
                                                                              //                   flag certain records (!R indicates tree crews were refused entry)
  // sLocalID: null,        // <sLocalID>          char(2)       [NULL]       //Mike Morely Email: ?.  Most values are null, but there are some “P” values.  
                                                                              //                   Not sure if it’s being used.
  // sPoleNum: null,        // <sPoleNum>          char(9)       Tower Number or [NULL]
  // sRemNum: null,         // <sRemNum>           char(8)       [NULL]       //Mike Morely Email: ?.   Most values are null, but there are values like “3934583”.  
                                                                              //                        I have no idea what it’s for…  Josh
  // sCustName2: null,      // <sCustName2>        char(15)      [NULL] or user entered
  // sCustPhone2: null,     // <sCustPhone2>       char(12)      [NULL] or user entered
  // sRACode3: null,        // <sRACode3>          char(2)       [NULL] or select from list below (alert code)
  // sRACode4: null,        // <sRACode4>          char(2)       [NULL] or select from list below (alert code)
  // sRACode5: null,        // <sRACode5>          char(2)       [NULL] or select from list below (alert code)
  // sRACode6: null,        // <sRACode6>          char(2)       [NULL] or select from list below (alert code)
  // bUnderBuild: 0,        // <bUnderBuild>       bit           [0],1 - Not sure if it's possible to visually determine if there is distrubution under the trans line
  // iPIRoute: null,        // <iPIRoute>          int           Incrementing number in order of inspection (1,2,3,... etc)
  // sXStreet: null,        // <sXStreet>          char(255)     [NULL] or Nearest cross street or NULL if none within 1 mile
  // sAPN: null,            // <sAPN>              char(50)      [NULL] or APN number
  // iEasement: null,       // <iEasement>         int           [NULL]
  // iSpanLength: null      // <iSpanLength>       int           [NULL] or Distance in ft. between tower 1 and tower 2
 
  // iBioUnitsTrim: null,   // <iBioUnitsTrim>     int           [NULL]
  // iBioUnitsRemoval: null // <iBioUnitsRemoval>  int           [NULL]
  // bVELBArea: 0,          // <bVELBArea>         bit           Location within Valley Elderberry protection zone = 1, else 0
  // sTWADocNum: null,      // <sTWADocNum>        char(15)      [NULL]
  // sTWAAgreement: null,   // <sTWAAgreement>     char(4000)    [NULL]
  // sTWASignedBy: null,    // <sTWASignedBy>      char(50)      [NULL]
  // gTWASignature: null,   // <gTWASignature>     <image>       [NULL]
  // dtTWASignedDate: null, // <dtTWASignedDate>   datetime      [NULL]
  // bHCPArea: null,          // <bHCPArea>          bit           [NULL]
  // sHCPAreaName: null,      // <sHCPAreaName>      char(50)      [NULL]
  // bE10cActivity:null,      // <bE10cActivity>     bit           [NULL]
  // iE10cAcreage: null,      // <iE10cAcreage>      int           [NULL]
  // bMBZ: null,              // <bMBZ>              bit           [NULL]
  // sMBZID: null,            // <sMBZID>            char(8)       [NULL]
  // sJointPoleUtility: null, // <sJointPoleUtility> char(60)      [NULL]
  // dtPrevInspDate: null,    // <dtPrevInspDate>    datetime      [NULL]
};


/**
 * @description TreeLocation consturctor - Tree locations group trees.  Each tree will have the same address and customer info.
 */
var TreeLocation = function(){
  this.location = _.extend({}, TREE_LOCATION);
  this.location.TreeRecs = [];
  this.trees = [];
  this.restrictions = [];
  // console.log("CREATING LOCATION", this.location);
};

/**
 * @description toXML 
 * @returns {String} xml string 
 */
TreeLocation.prototype.toXML = function() {
  return js2xmlparser(root_node, this.location);
};

/**
 * @description add a TreeRecord to this location
 * @param {TreeRecord} tree the tree record to add to this location
 */
TreeLocation.prototype.addTree = function(tree){
  this.trees.push(tree);
  //TODO: get and check location properties from trees.
  
  var div_code = vmd.division_codes[tree.get("division")];
  this.set("sDivCode", div_code);
  this.set("sInspComp", vmd.company_codes[tree.get("inspector_company")]);
  this.set("sInsp", tree.get("inspector"));

  this.pmd_num = tree.get("pge_pmd_num");
  if(this.pmd_num.endsWith("BLM")) {
    this.pmd_num = this.pmd_num.replace("BLM", '');
  }
  
  var voltage = tree.get("line_voltage");
  var line_type = tree.get("line_type");
  var line_number = tree.get("line_number");

  this.set("sPriVolt", voltage);
  
  assert(tree.get("line_type"), "Tree needs to have line type");
  if(line_type === "transmission") {  
    var circuit = tree.get("vmd_circuit_num");
    assert(circuit, "Missing VMD Circuit ID: "+tree.get("_id"));
    assert(vmd.transmison_circuit_codes[div_code], tree.get("_id"));
    this.set("sCircuit", circuit);    
    this.set("sLineID", line_number);
  } else {
    this.set("sCircuit", line_number);    
  }
    
  this.set("sStreetNum", tree.get("streetNumber") || 0);
  this.set("sStreet", tree.get("streetName") || "NO ROAD");    
  this.set("sCity", tree.get("city").substring(0, 11));    
  this.set("iCityID", vmd.city_codes[tree.get("city").toUpperCase()]);
  this.set("sCountyCode", vmd.county_codes[tree.get("county").toUpperCase()]);
  
  if(tree.get("notify_customer_value")) {
    //using the first comment for nows
    this.set("sComments", tree.get("notify_customer_value"));
  }
  
  this.set("dtInspDate", tree.get("dtInspDate"));
  
  var towers = tree.get("span_name").split("-");
  this.set("sSourceDev", towers[0]);
  this.set("sPoleNum", towers[0]);
  this.set("sPoleNum2", towers[1]);
  
  this.set("ExternalLocID", tree.get("workorder_id"));

  this.set("sAcctType", tree.get("sAcctType"));
  
  var gps_location = tree.getLocation();
  if(gps_location) {
    var gps = new GPS("TreeLoc", gps_location.coordinates[1], gps_location.coordinates[0], tree.gps_acq_date);
    this.location[gps.root_node] = gps.getData();
  }
  

  this.location.TreeRecs = this.location.TreeRecs || [];  
  this.location.TreeRecs.push(tree.getData());
  tree.set("iTreeSort", this.location.TreeRecs.length);

  Restriction.createLocRestrictions(this);  
  Alert.createLocAlerts(this);
  this.set("sTreeLocStatus", this.getLocationStatus(tree));  
  
  this.validateRequired();
};


TreeLocation.prototype.setFromTree = function(key, value) {
  var packet = this.packet;

  if(!packet[key]) {
    packet[key] = value;
  } else if(packet[key] !== value) {
    throw new Error('Can not add location with different '+key+" : "+packet[key]+" >> "+value);
  }
};

TreeLocation.prototype.validateRequired = function() {
  this._testValue("sAcctType", _.values(vmd.account_types));
  this._testValue("sDivCode", _.values(vmd.division_codes));
  //this._testValue("sCircuit", _.values(vmd.circuit_numbers));
  assert(this.get("sLineID"), "Location needs to have line_id");
  
};

TreeLocation.prototype._testValue = function(key, acceptible) {
  assert(_.contains(acceptible, this.get(key)), "Bad "+key+": "+this.get(key));
};



TreeLocation.prototype.getLocationStatus = function(){  
  
  
  var codes = {
    restrictions: {
      ready: "work_no_restrict",  
      not_ready: "work_with_restrict",
      no_trim: "no_work_with_restrict",
      left: "open",
      worked: "work_no_restrict"
    },
    no_restrictions: {
      ready: "work_no_restrict",  
      not_ready: "open",
      no_trim: "no_work_no_restrict",
      left: "open",
      worked: "work_no_restrict"
    }
  };

  var code_priority = { 
    "work_complete": 1,
    "open": 2, 
    "no_work_no_restrict": 3,
    "no_work_with_restrict": 4,
    "work_no_restrict": 5,
    "work_with_restrict": 6,
  };

  var final;
  for(var i = 0; i < this.trees.length; i++) {
    var tree = this.trees[i];
    var restrict;
    var status = tree.getStatus();
    if(tree.hasRestrictions()){
      restrict = "restrictions";
    } else {
      restrict = "no_restrictions";
    }
    
    
    var code = codes[restrict][status];
    
    if(!final || code_priority[code] > code_priority[final]) {
      final = code;
    }
  }
  
  delete this.location.TreeLocRestrictions;
  if(final === "no_work_with_restrict" || final === "work_with_restrict") {
    assert(this.restrictions && this.restrictions.length > 0, "with_restrict status code and no restrictions");
    this.location.TreeLocRestrictions = [];
    for(i = 0; i < this.restrictions.length; i++) {
      this.location.TreeLocRestrictions.push(this.restrictions[i].getData());
    }    
  }
  
  return vmd.location_status[final];  
};

TreeLocation.prototype.clearRestrictions = function() {
  delete this.restrictions;
};

TreeLocation.prototype.addRestriction = function(restrict) {
  this.restrictions = this.restrictions || [];
  this.restrictions.push(restrict);
};

TreeLocation.prototype.clearAlerts = function() {
  delete this.alerts;
  delete this.location.TreeLocAlerts;
};

TreeLocation.prototype.addAlert = function(alert) {
  this.alerts = this.alerts || [];
  this.alerts.push(alert);
  this.location.TreeLocAlerts = this.location.TreeLocAlerts || [];
  this.location.TreeLocAlerts.push(alert.getData());
};

TreeLocation.prototype.get = function(key) {
  return this.location[key];
};
TreeLocation.prototype.set = function(key, value) {
  this.location[key] = value;
};

TreeLocation.prototype.getPMDNum = function() {
  return this.pmd_num;
};

TreeLocation.prototype.getData = function() {
  return this.location;
};

module.exports = TreeLocation;
