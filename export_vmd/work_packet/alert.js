/**
 * @fileoverview This creates an alert xml for a tree record or tree location
 */


var _ = require('underscore');
var vmd = require("dsp_shared/lib/pge_vmd_codes");
// var assert = require('assert');

var ALERT = {         // <TreeRecsAlerts> or <TreeLocAlerts>
                      //   <iTreeLocID> int         *LocationID
  sRACode: null,      //   <sRACode> char(2)        *Alert code from list below
  sUserID: null,      //   <sUserID> varchar(50)    *[UserID]
  dtDateAdded: null   //   <dtDateAdded> datetime   *[Inspection Date]
};                    // </TreeRecsAlerts> or </TreeLocAlerts>

// Alert List: (L=Location alert, T=Tree alert, B=Both Location and Tree alert)
// ----------------------------------------------------------------------------
// sRACode  sDescrip                   iSortOrd  bComFlag  sLT            sComment
// AP      Access Permit                1         0         L              NULL
// AX      Access                       9         0         L              For use where we have a specific access permit granted by 
//                                                                              an agency.  Ex: BLM or State lands.
// BD      Bad Dog                      3         0         L              Aggressive Dog.  Obtain customer phone number.
// BW      Bee/Wasp                     3         NULL      L              Indicates Bee/Wasp threat
// C1      CAT 1                        99        0         T              NULL
// C2      CAT 2                        99        0         T              NULL
// C3      CAT 3                        99        0         T              NULL
// DG      Dog                          4         0         L              For use with  loose dogs.  Obtain customer phone number.
// EB      Environmental BMP            99        0         L              NULL
// EP      Existing New Planting        99        0         L              NULL
// ES      Endangered Species           20        1         NULL           NULL
// ET      Existing Trans Mit Plan      99        0         L              NULL
// FZ      Fire Threat Zone             40        0         L              NULL
// HC      HOC                          99        0         L              NULL
// IC      Concerned Customer           5         0         L              Did you state the concern in the comments.
// LG      Locked Gate                  8         0         L              Obtain customers phone number and lock combo if appropriate.
// LI      Livestock                    8         NULL      L              Indicates Livestock present
// MC      Mid Span Clear               31        0         L              Orchard New Planting - Grower has partialy cleared ROW?
// MZ      HCP Mapbook Zone             21        1         NULL           NULL
// NB      Nest BMP                     99        0         T              NULL
// NF      Notify First                 13        0         L              NULL
// NP      New Planting                 30        1         NULL           NULL
// PI      PI Notify First              16        NULL      L              PI needs to notify customer before inspecting
// PN      Past Nest Review             99        0         T              NULL
// PO      Poison-Oak                   6         0         L              REMEMBER: Be careful with contaminated clothes and hands.  
//                                                                                    Wear long sleeves!
// PP      Past R-Review                99        0         T              NULL
// PR      Past Refusal                 10        0         B              NULL
// RA      Riparian Area                22        0         L              NULL
// RP      Riparian                     98        0         L              NULL
// TH      Tree House                   99        0         T              NULL
// TM      Mitigation Plan              35        1         NULL           NULL
// TR      Traffic Issue                2         0         L              NULL
// VS      VELB Site                    99        0         L              NULL
// WC      Whole Span Clear             32        0         L              Orchard New Planting - Grower has cleared ROW?
// X4      2014 Work                    99        0         T              NULL
// X5      2015 Work                    99        0         T              NULL
// X6      2016 Work                    99        0         T              NULL
// X7      2017 Work                    99        0         T              NULL
// X8      2018 Work                    99        0         T              NULL
// X9      2019 Work                    99        0         T              NULL
// Y0      2020 Work                    99        0         T              NULL
// Y1      2021 Work                    99        0         T              NULL
// Y2      2022 Work                    99        0         T              NULL
// Y3      2023 Work                    99        0         T              NULL
// Y4      2024 Work                    99        0         T              NULL
// YL      Concurrent Patrol-LOC        14        NULL      B              Indicates location and tree is part of a YL Concurrent Patrol
// YS      Concurrent Patrol-SYS        15        NULL      B              Indicates location and tree is part of a YS Concurrent Patrol





/**
 * @description Constructor for Alert
 * @param {String} type type of allert (tree or location)
 * @param {String} alert_code alert code that can be mapped in pge_vmd_codes
 * @param {String} user User string
 * @param {String} date inspection date (or date restriction was added)
 */
var Alert = function(type, alert_code, user, date) {
  this.root_node = {
    Loc: "TreeLocAlerts",
    TreeLoc: "TreeLocAlerts",
    Rec: "TreeRecsAlerts",
    TreeRec: "TreeRecsAlerts"
  }[type];
  
  
  if(alert_code) {
    this.alert = _.extend({}, ALERT);
    this.alert_code = alert_code;
    this.alert.sRACode = vmd.alert_codes[alert_code];
    this.alert.sUserID = user;
    this.alert.dtDateAdded = date;    
  } else {  
    throw Error("No Alert Code");
  }
};

Alert.prototype.getData = function() {
  return this.alert;
};


Alert.createTreeAlerts = function(tree) {
  if(tree.statusFlags.environment === "raptor nest") {
    var alert = new Alert("Rec", "nest bmp", tree.get('sInsp'), tree.get('dtInspDate'));
    tree.addAlert(alert);
  }  
};

Alert.createLocAlerts = function(location) {
  location.clearAlerts();
  var alert_codes = new Set();
  var trees = {};  
  var tree;
  
  for(var i = 0; i < location.trees.length; i++) {
    tree = location.trees[i];
    if(tree.statusFlags.dog) {
      alert_codes.add("dog");
      trees.dog = tree;
    }
    if(tree.statusFlags.irate_customer) {
      alert_codes.add("concerned customer");
      trees["concerned customer"] = tree;
    }
    if(tree.statusFlags.notify_customer) {
      alert_codes.add("notify first");
      trees["notify first"] = tree;      
    }
    if(tree.statusFlags.environment === "riparian") {
      alert_codes.add("riparian");
      trees.riparian = tree;      
    }
    if(tree.statusFlags.environment === "velb") {
      alert_codes.add("velb site");
      trees["velb site"] = tree;            
    }
  }

  alert_codes.forEach(function(alert_code){
    tree = trees[alert_code];
    var res = new Alert("Loc", alert_code, tree.get('sInsp'), tree.get('dtInspDate'));
    location.addAlert(res);    
  });
};

module.exports = Alert;