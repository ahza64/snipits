/**
 * @fileoverview This file creates a workpacket JSON sturcture that can be turned into xml
 */


/* jshint maxlen: 180 */
var _ = require("underscore");
var vmd = require('dsp_shared/lib/pge_vmd_codes');
var js2xmlparser = require("js2xmlparser");
var assert = require('assert');
var root_node = "TreeWorkPacket";
var WORK_PACKET = {                            // <TreeWorkPacket>
    // "@": {
    //   "xmlns":"http://www.dispatchr.co/vmd",
    //   "xmlns:xsi":"http://www.w3.org/2001/XMLSchema-instance",
    //   "xsi:schemaLocation":"export_vmd/sxd/work-request.xsd"
    // },
    sAcctType: null, //    <sAcctType>         varchar(1)*   [W], R, Y, Z (see list below)
    sRoleType: "PI",                           //    <sRoleType>         varchar(2)*   [PI], TT - TT is no valid as work packets are never created for trimmers
    sDT: "T",                                  //    <sDT>               varchar(1)*   D, [T]//T for transmission, D for distribution
    sDivCode: null,                            //    <sDivCode>          varchar(2)*   User selected value (listed in appendix)
    iProjID: null,                             //    <iProjID>           int           [NULL] or user supplied value
    bQC: 0, //we are not doing QC work         //    <bQC>               bit*          [0], 1
    bReadOnly: 0, //no need to do read pm;     //    <bReadOnly>         bit*          [0], 1
    sInspComp: null,                           //    <sInspComp>         varchar(3)    [NULL] or user supplied value from list below
    sAssignedUser: null,                       //    <sAssignedUser>     varchar(50)   [NULL] or user supplied value
    bObsolete: 0, // not obsolete              //    <bObsolete>	       bit*          [0], 1

    sWorkPacketStatus: "CMP",                  //    <sWorkPacketStatus> char(3)       [NEW], INP, CMP

    //defaulting these non required fields
    sTransmitStatus: "CI",                  //    <sTransmitStatus>   char(2)       [CI], CO
    sComments: null,                        //    <sComments>         varchar(1024) [NULL]  or user supplied value - **Recommend using import batch ID from external system
    bAdHoc: 1,                              //    <bAdHoc>            bit           0, [1]
    sGenType: "T0",                         //    <sGenType>          char(2)       [T0],TS,TR,C0,CS,CR
    iPacketParent: null,                    //    <iPacketParent>     int           [NULL]

    TreeLoc: null                           //   <TreeLoc>                          Inspected Locations(s)
};                                          // </TreeWorkPacket>

/**
 * @description WorkPacket constructuor
 * @param {String} test_email An optional email address to add for exports to the test system.
 */
function WorkPacket(test_email){
  this.packet = _.extend({}, WORK_PACKET); 
  this.packet.TreeLoc = [];
  if(test_email) {
    this.packet.sEmailID = test_email;
  }
}

/**
 * @description add a TreeLocation object to this WorkPacket
 * @param {TreeLocation} location A TreeLocation to add to this work packet
 */
WorkPacket.prototype.addLocation = function(location){
  var packet = this.packet;
  
  this.setFromLocation("sDivCode", location.get("sDivCode"));
  this.setFromLocation("iProjID", location.getPMDNum());
  
  this.setFromLocation("sAssignedUser", location.get("sInsp"));
  this.setFromLocation("sInspComp", location.get("sInspComp"));
  this.setFromLocation("sAcctType", location.get("sAcctType"));

  packet.TreeLoc.push(location.getData());
    
  location.set("iSSDRoute", 10);
  location.set("iRouteNum", this.packet.TreeLoc.length*10);
};


WorkPacket.prototype.setFromLocation = function(key, value) {
  var packet = this.packet;
  
  if(!packet[key]) {
    packet[key] = value;
  } else if(packet[key] !== value) {
    throw new Error('Can not add location with different '+key+" : "+packet[key]+" >> "+value);
  }  
};

WorkPacket.prototype.validateRequired = function() {
  this._testValue("sAcctType", _.values(vmd.account_types));
  this._testValue("sDivCode", _.values(vmd.division_codes));
};

WorkPacket.prototype._testValue = function(key, acceptible) {
  assert(_.contains(acceptible, this.packet[key]), "Bad "+key+": "+this.packet[key]);
};



/**
 * @description toXML 
 * @returns {String} xml string 
 */
WorkPacket.prototype.toXML = function() {
  return js2xmlparser(root_node, this.packet);
};


module.exports = WorkPacket;
