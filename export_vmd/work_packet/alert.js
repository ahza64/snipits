/**
 * @fileoverview This creates an alert xml for a tree record or tree location
 */

/**
* 
* NOTE:
* 
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
    this.alert.sRACode = vmd.alert_code[alert_code];
    this.sUserID = user;
    this.dtDateAdded = date;    
  } else {  
    throw Error("No Alert Code");
  }
};

Alert.prototype.getData = function() {
  return this.alert;
};


Alert.createTreeAlerts = function(tree) {
  var alert; 

  try {
    alert = new Alert();
    tree.addAlert(alert);    
  } catch (e) {
    //ok
  }
  
};

Alert.createLocAlerts = function(location) {
  location.clearAlerts();
  var alert_codes = new Set();
  var user, date, tree;
  for(var i = 0; i < location.trees.length; i++) {
    tree = location.trees[i];
    user = user || tree.get('sInsp');
    date = date || tree.get('dtInspDate');
  }
  for(i = 0; i < location.trees.length; i++) {
    tree = location.trees[i];
  }


  alert_codes.forEach(function(alert_code){
    try {
      var res = new Alert(alert_code, user, date);
      location.addAlert(res);    
    } catch (e) {
      //ok
    }
  });
};

module.exports = Alert;