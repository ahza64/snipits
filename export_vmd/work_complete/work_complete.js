/**
 * @fileoverview This describes a tree work complete record for the vmd
 */


/**
 *   NOTES:
 *     Exports are hard coded with sAcctType === M for mantainance 
 *         (Be aware that this will have to change if we export orchard trees)
 */

const assert = require('assert');
const TreeStates = require('tree-status-codes');
const _ = require("underscore");
const js2xmlparser = require("js2xmlparser");

const root_node = "TreeWorkComp";
const vmd = require("dsp_shared/lib/pge_vmd_codes");
const JPGImage = require('../work_packet/jpg_file.js');

require("sugar");
const TIME_AND_MATERIALS_SWITCH_DATE = Date.create("Aug 1 2016 PST");
console.log("TIME_AND_MATERIALS_SWITCH_DATE", TIME_AND_MATERIALS_SWITCH_DATE);

/* jshint maxlen: 180 */
const TREE_WORK_COMP = {                  //<TreeWorkComp>
  sWorkBy: null,                          //   **<sWorkBy>                      varchar(15)   Crew/Foreman info
  
  dtWorkDate: null,                       //   **<dtWorkDate>                   datetime      *Date and time that the tree was worked
  nQty: 1,                                //   ** 1) <nQty>                     numeric(5,2)  *Number of units trimmed (>0 and <1000)
  // nManHours: null,                     //   <nManHours>                      numeric(5,2)  Optional - Number of work hours (for time and material billing only)
  bCompleted: null,                       //   <bCompleted>                     bit           *[1] Indicates work was completed.  Contractors can submit work as not completed [0]
    
  sTreeCode: null,                        //   <sTreeCode>                      varchar(4)    Type of tree
  sTrimCode: null,                        //   <sTrimCode>                      varchar(3)    Trim type
  sCrewType: null,                        //   <sCrewType>                      varchar(2)    Type of crew dispatched to tree (climb/lift truck,)

  nDistance: null,                        //   <nDistance>                      numeric(2,0)  Clearance obtained in ft

  // sWrkRptNum: null,                    //   <sWrkRptNum>                     varchar(7)    Optional - Used by contractors to tag batch of work submitted.  
                                          //                                                  Usually a date is entered here.
  // iWrkRptSeq: null,                    //   <iWrkRptSeq>                     tinyint       Optional - If multiple batches are submitted during a day, value can be incrimented.  
                                          //                                                  Default [0,]

  // mCost: null,                         //   <mCost>                          money         Optional - Fixed price for work
  sBillingCode: null,                     //   ** <sBillingCode>                varchar(2)    *Billing code determines price for unit of work
  iBillingRate: null,                     //   ** <iBillingRate>                tinyint       Billing method (0=std, 1=overtime, 2=double, 7=time/material, 8=Non-Billable)
                                          //   
  sComments: null,                        //   <sComments>                      varchar(255)  Optional - billing notes to document unusual situations

  ExternalTreeID: null,                   //   ** <ExternalTreeID>              varchar(50)   **Required for external system, not required for internally created work
  ExternalWRID: null,                     //   <ExternalWRID>                   varchar(50)   Optional - Work Request/Work Order used by external system
  "ExternalWRParam-sDivCode": null,       //   <ExternalWRParam-sDivCode>       varchar(2)    Not required, can be determined from inspection record
  // "ExternalWRParam-sLocalOffice": null,//   <ExternalWRParam-sLocalOffice>   varchar(2)    Not required, can be determined from inspection record
                                          //   CE - CEMA  TR - Transmission
  
  "ExternalWRParam-sAcctType": null,      //   <ExternalWRParam-sAcctType>      varchar(1)    Not required, can be determined from inspection record
  "ExternalWRParam-sDT": "T",             //   <ExternalWRParam-sDT>            varchar(1)    Not required, can be determined from inspection record
  "ExternalWRParam-sContCode": null,      //   ** <ExternalWRParam-sContCode>   varchar(3)    **Required for external system, not required for internally created work
  "ExternalWRParam-sWorkCat": null,       //   <ExternalWRParam-sWorkCat>       varchar(2)    **Required for external system, not required for internally created work
                                          //                                                  (RT = routine, EM = emergency)
  // "ExternalWRParam-sOrderNum": null,   //   <ExternalWRParam-sOrderNum>      varchar(10)   Optional for routine work, but should be populated for non-routine
  "ExternalWRParam-iProjNum": null,       //   <ExternalWRParam-iProjNum>       int           Optional, but should be populated for reporting
  
  
  // iWRTreeRecsID: null,                 //   <iWRTreeRecsID>                  int           **Required for internally created work, not required for external system
  // sWorkReq: null,                      //   <sWorkReq>                       varchar(11)   **Work request number - Required for internally created work, 
                                          //                                                  not required for external system
  // sReason: null                        //   <sReason>                        varchar(3)    Not used
  // sBatchCode: null,                    //   <sBatchCode>                     varchar(20)   Optional - Field used by contractors to find batches of work submitted to PG&E 
};                                        // </TreeWorkComp>

// some date in july we move from sBillingCode = 'XX' to some other billing code

var TreeWorkComplete = function(tree, trimmer, image, test_email) {
  if(tree.tc_image && !image) {
    console.error("ERROR tree image missing", tree._id, tree.tc_image);
    throw new Error("tree image missing");
  }
  
  this.statusFlags = TreeStates.fetchStatusFlags(tree.status);
  

  
  this.work_complete = _.extend({}, TREE_WORK_COMP);


  this.work_complete.sWorkBy = trimmer.uniq_id +" : "+trimmer.first+" "+trimmer.last;
  this.work_complete.dtWorkDate = JSON.parse(JSON.stringify(tree.tc_complete_time));
  this.work_complete.bCompleted = this.statusFlags.status === "worked" ? 1 : 0;
  this.work_complete.sTreeCode = vmd.tree_types[tree.species];
  this.work_complete.sTrimCode = vmd.trim_codes[tree.trim_code];

    
  this.work_complete.ExternalTreeID = tree.qsi_id || tree._id.toString();
  this.work_complete.ExternalWRID = tree.workorder_id;
  
  if(tree.clearance !== null && tree.clearance !== undefined) {
    this.work_complete.nDistance = Math.min(99, tree.clearance.toFixed());
  }

  if(this.statusFlags.vehicle_type) {
    this.work_complete.sCrewType = vmd.crew_type[this.statusFlags.vehicle_type];  
  } else {
    delete this.work_complete.sCrewType;
  }
  

  if(typeof tree.tc_complete_time === "string") {
    tree.tc_complete_time = Date.create(tree.tc_complete_time);
    assert(tree.tc_complete_time.isValid(), "Invalid tc complete date");
  }
  if(tree.tc_complete_time.isAfter(TIME_AND_MATERIALS_SWITCH_DATE)) {
    assert(vmd.trim_code_to_billing_code[this.work_complete.sTrimCode]);
    this.work_complete.sBillingCode = vmd.trim_code_to_billing_code[this.work_complete.sTrimCode];
  } else {
    this.work_complete.sBillingCode = "XX";
  }
      
  if(tree.comments) {
    var matches = tree.comments.match(/#([0-9]*)#/);
    if(matches) {
      this.work_complete.nQty = matches[1];
    }
  }
  
  this.work_complete.iBillingRate = {
    null: 0,
    undefined: 0,
    standard: 0,
    overtime: 1
  }[tree.tc_overtime];
  
  assert(this.work_complete.iBillingRate !== undefined, "Unknown overtime code");
  
  this.work_complete["ExternalWRParam-sDivCode"] = vmd.division_codes[tree.division];

  // We are curretly only exporting trees as Maintenance 
  // TODO: Update sAcctType if we ever export Orchard trees
  // if(pmd.type.startsWith("Orchard")) {
  this.work_complete["ExternalWRParam-sAcctType"] = vmd.account_types.Maintenance;
  this.work_complete["ExternalWRParam-iProjNum"] = tree.pge_pmd_num;  
  if(tree.pge_pmd_num.endsWith("BLM")) {
    this.work_complete["ExternalWRParam-iProjNum"] = tree.pge_pmd_num.replace("BLM", '');
  }
  
  
  this.work_complete["ExternalWRParam-sContCode"] = vmd.company_codes[trimmer.company];
  this.work_complete["ExternalWRParam-sWorkCat"] = vmd.work_categories.routine;
  
  if(tree.tc_image && !image) {
    console.error("TREE IMAGE MISSING: "+ tree.tc_image+" on tree: "+ tree._id);
  }
  if(image) {
    var jpg = new JPGImage(image);
    this.work_complete.TreeWorkCompFile = [jpg.getData()];
  }
  
  if(test_email) {
    this.work_complete.sEmailID = test_email;
  }
  
  this.validateWC();
};

TreeWorkComplete.prototype.validateWC = function(){
  this._testValue('ExternalWRParam-sContCode', _.values(vmd.company_codes));
  assert(this.work_complete.dtWorkDate, "missing dtWorkDate");
  this._testValue('sTreeCode', _.values(vmd.tree_types));
  this._testValue('sTrimCode', _.values(vmd.trim_codes));
  isNumeric(this.work_complete["ExternalWRParam-iProjNum"]);
   
};

//https://github.com/jquery/jquery/blob/master/src/core.js
function isNumeric( obj ) {

		return ( _.isNumber(obj) || _.isString(obj) ) &&

		// parseFloat NaNs numeric-cast false positives ("")
		// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
		// subtraction forces infinities to NaN
		!isNaN( obj - parseFloat( obj ) );
}


TreeWorkComplete.prototype.get = function(key) {
  return this.work_complete[key];
};

TreeWorkComplete.prototype._testValue = function(key, options) {
  assert(_.contains(options, this.work_complete[key]), "Invalid value for "+key+" > "+this.work_complete[key]);
};

TreeWorkComplete.prototype.toXML = function() {
  return js2xmlparser(root_node, this.work_complete, {declaration: {include: false}});
};

module.exports = TreeWorkComplete;
