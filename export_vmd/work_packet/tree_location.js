/**
 @fileoverview PGE VMD TreeLocation creates vmd and xml values
*/
var _ = require("underscore");

var js2xmlparser = require("js2xmlparser");
var vmd = require("dsp_shared/lib/pge_vmd_codes");


/**
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
*     TODO: ExternalLocID - static workorder
* 
*     NEED WORKORDER ID
* 
*   Sent Email:
*     sTagType: Defualted to D not sure how to decide on these
*     sTreeLocStatus: Not sure how to translate each of these
*     still unclear about these optional fields is this
*         sPCC
*         sMisc
*         sLocalID
*         sRemNum
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
  sTagType: "D",        // <sTagType>          char(1)       *[D] or select from list below  
  sStreetNum: null,     // <sStreetNum>        char(11)      *Use APN street number or [0]
  sStreet: null,        // <sStreet>           char(26)      *Use APN street name or [NO ROAD]
  sCity: null,          // <sCity>             char(11)      *First 11 char of city, or nearest city if in unicorporated county territory
  iCityID: null,        // <iCityID>           int           From city list below    
  sComments: null,      // <sComments>         char(255)     [NULL]
  bCommAlert: 0,        // <bCommAlert>        bit           *[0]
  dtInspDate: null,     // <dtInspDate>        datetime      Inspection Date (flyover date)
  sAcctType: "R",       // <sAcctType>         char(1)       [W], R, Y, Z or from list below


  sSourceDev: null,     // <sSourceDev>        char(8)       *Use Tower ID xxx/xxx
  sPoleNum: null,       // <sPoleNum>          char(9)       Tower Number or [NULL]
  sPoleNum2: null,      // <sPoleNum2>         char(9)       [NULL] or Next Tower Number in span (xxx/xxx)  
  sPriVolt: null,       // <sPriVolt>          char(3)       Highest Line voltage on span or [NULL] if unknown  

  sCustName: null,      // <sCustName>         char(15)      Customer Name from APN or [NULL]
  sCustPhone: null,     // <sCustPhone>        char(12)      Customer Phone from APN or [NULL]
  bCustAtLoc: 0,        // <bCustAtLoc>        bit           *[0]

  sTreeLocStatus: null,  // <sTreeLocStatus>    char(10)      [CMP_WK_NR], or value from list below
  ExternalLocID: null,   // <ExternalLocID>     varchar(50)   Unique identifier of location from external source system
  TreeRecs: null,
  
  
  bSRA: null,           // <bSRA>              bit           *SRA = 1 if state/federal fire responsibility area, else 0 for LRA
  //omiting thes optional values
  // sArea: null,           // <sArea>             char(10)      [NULL]
  // sQuadMap: null,        // <sQuadMap>          char(11)      [NULL]
  // sMapType: null,        // <sMapType>          char(1)       [NULL]
  // sMapTypeNum: null,     // <sMapTypeNum>       char(8)       [NULL]
  // sTagNum: null,         // <sTagNum>           char(10)      [NULL]
  // sDirections: null,     // <sDirections>                     [NULL]
  // sRACode1: null,        // <sRACode1>                        [NULL] or select from list below
  // sRACode2: null,        // <sRACode2>          char(2)       [NULL] or select from list below
  // sSConst: null,         // <sSConst>           char(1)       [NULL]
  // sPCC: null,            // <sPCC>              char(6)       [NULL]
  // sMisc: null,           // <sMisc>             char(5)       [NULL]
  // sLocalID: null,        // <sLocalID>          char(2)       [NULL]
  // sPoleNum: null,        // <sPoleNum>          char(9)       Tower Number or [NULL]
  // sRemNum: null,         // <sRemNum>           char(8)       [NULL]
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

var TreeLocation = function(){
  this.location = _.extend({}, TREE_LOCATION);
  this.location.TreeRecs = [];
  this.trees = [];
  // console.log("CREATING LOCATION", this.location);
};

TreeLocation.prototype.toXML = function() {
  return js2xmlparser(root_node, this.location);
};

TreeLocation.prototype.addTree = function(tree){
  
  //TODO: get and check location properties from trees.
  
  var div_code = vmd.division_codes[tree.get("division")];
  this.set("sDivCode", div_code);
  this.set("sInspComp", vmd.inspection_companies[tree.get("inspector_company")]);
  this.set("sInsp", tree.get("inspector"));

  this.pmd_num = tree.get("pge_pmd_num");

  var voltage = tree.get("line_voltage");
  var line_type = tree.get("line_type");
  var line_number = tree.get("line_number");

  this.set("sPriVolt", voltage);
  if(line_type === "transmission") {  
    var circuit = vmd.transmison_circuit_codes[div_code][voltage];
    this.set("sCircuit", circuit);    
    this.set("sLineID", line_number);
  } else {
    this.set("sCircuit", line_number);    
  }
    
  this.set("sStreetNum", tree.get("streetNumber"));
  this.set("sStreet", tree.get("streetName"));    
  this.set("sCity", tree.get("city").substring(0, 11));    
  this.set("iCityID", vmd.city_codes[tree.get("city").toUpperCase()]);
  this.set("sCountyCode", vmd.county_codes[tree.get("county").toUpperCase()]);
  
  if(!this.get("sComments")) {
    //using the first comment for nows
    this.set("sComments", tree.get("comment") || null);
  }
  
  this.set("dtInspDate", tree.get("pi_complete_time"));
  
  var towers = tree.get("span_name").split("-");
  this.set("sSourceDev", towers[0]);
  this.set("sPoleNum", towers[0]);
  this.set("sPoleNum2", towers[1]);
  
  
  this.trees.push(tree);
  this.location.TreeRecs.push(tree.getData());
  tree.set("iTreeSort", this.location.TreeRecs.length);
  
};

TreeLocation.prototype.get = function(key) {
  return this.location[key];
};
TreeLocation.prototype.set = function(key, value) {
  this.location[key] = value;
};

TreeLocation.prototype.getPMDNum = function() {
  return this.pmd_num;
}

TreeLocation.prototype.getData = function() {
  return this.location;
}
module.exports = TreeLocation;
