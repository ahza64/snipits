/**
 * @fileoverview This creates a restriciton xml for a tree record or tree location
 */

/*
* 
* NOTE:
*   iTreeLocID is in both Rec and Loc for the doc
* 
*   Can you have more than one restriction?
*   What are Refusal R and R-Refusal
*   More into on all restrictions
*   Best option for "other" === "quarantine?"
*   TODO: more testing of restrictions
*   TODO: test location restrictions with mulitple trees with the same restriction
* 
* Mike Morely:
*     If a tree or location record has an associated “restriction” , then it means that the tree cannot be trimmed until 
*     the restriction is removed.  An example would be a NEST REVIEW restriction (NR).  If there is a nest review restriction, a 
*     biologist must review and approve before the work can be issued to a tree contractor.
* 
*/

/*
 * Code     sRefusalType     sLT          sDescrip                      sNotification
 * DM         DBM            T            Debris Management              NULL
 * EG         EAG            L            Eagle                          Q
 * HN         HN             T            Hazard Notification            O
 * NP         NEW            L            New Planting                   NULL
 * NR         NST            L            Nest Review                    Q
 * PL         PL             L            Private Line                   NULL
 * QT         QRT            B            Quarantine                     Q
 * RF         REF            B            Refusal R                      NULL
 * RP         RIP            T            R-Review                       Q
 * TM         TM             L            Transmission Mitigation Plan   NULL
 * VR         VLB            T            VELB Removal                   Q 
*/

var _ = require('underscore');
var vmd = require("dsp_shared/lib/pge_vmd_codes");
var assert = require('assert');


var RESTRICTION = {             // <TreeRecsRestrictions> or <TreeLocRestrictions>
                                //   <iTreeLocID> [int]       *LocationID
  sRestrictionCode:     null,   //   <sRestrictionCode> [char](2)    *Restriction code
  bTreeRecsRestriction: null,   //   <bTreeRecsRestriction> [bit]    IF related sLT value is L, then 0, else 1  
  sUserID:              null,   //   <sUserID> [varchar](50)     *[UserID]
  dtDateAdded:          null,   //   <dtDateAdded> [datetime]     *[Inspection Date]
};                              // </TreeRecsRestrictions> or </TreeLocRestrictions>


var q_notifiy = ["eagle", "hazard_notify", "nest_review", "quarantine", "r_review", "velb_removal"];


// var LT = {
//   "transmission_mitigation":   "L",
//   "eagle":                     "L",
//   "new_planting":              "L",
//   "nest_review":               "L",
//   "private_line":              "L",
//   "debris_management":         "T",
//   "hazard_notify":             "T",
//   "r_review":                  "T",
//   "velb_removal":              "T",
//   "quarantine":                "B",
//   "refusal_r":                 "B"
// };


/**
 * @description Constructor for restriction
 * @param {String} type type of restriction (tree or location)
 * @param {String} restrict_code restrictions code that can be mapped in pge_vmd_codes
 * @param {String} user User string
 * @param {String} date inspection date (or date restriction was added)
 */
var Restriction = function(type, restrict_code, user, date) {
  this.root_node = {
    Loc: "TreeLocRestrictions",
    TreeLoc: "TreeLocRestrictions",
    Rec: "TreeRecsRestrictions",
    TreeRec: "TreeRecsRestrictions"
  }[type];
  
  
  if(restrict_code) {
    this.restrict = _.extend({}, RESTRICTION);
    this.restrict_code = restrict_code;
    this.restrict.sRestrictionCode = vmd.restriction_codes[restrict_code];
    this.restrict.bTreeRecsRestriction = this.root_node === "TreeLocRestrictions" ? 0 : 1;
    this.restrict.sUserID = user;
    this.restrict.dtDateAdded = date || null;
  } else {  
    throw Error("No Restriction Code");
  }
};

Restriction.prototype.getData = function() {
  return this.restrict;
};

/**
 * @description create a tree restrictions
 * @param {Object} tree tree to inspect and add restrictions too
 */
Restriction.createTreeRestricitons = function(tree) {
  var res; 
  if(tree.statusFlags.refused) {
    res = new Restriction("tree", "refusal_r", tree.get('sInsp'), tree.get('dtInspDate'));
    tree.addRestriction(res);
  }

  res = {
    "velb": "velb_removal",
    "riparian": "quarantine"
  }[tree.statusFlags.environment];  
  
  if(res) {
    res = new Restriction("Rec", res, tree.get('sInsp'), tree.get('dtInspDate'));
    tree.addRestriction(res);
  }
  
};

Restriction.createLocRestrictions = function(location) {
  location.clearRestrictions();
  var restrict_codes = new Set();
  var trees = {};
  var tree;

  for(var i = 0; i < location.trees.length; i++) {
    tree = location.trees[i];
    if(tree.statusFlags.refused) {
      restrict_codes.add("refusal_r");
      trees.refusal_r = tree;
    }
    
    
    var restrict_code = {
      "raptor_nest": "nest_review",
      "riparian":    "quarantine",
      "other":       "quarantine",
      "velb":        "velb_removal"    
    }[tree.statusFlags.environment];
    if(restrict_code) {
      restrict_codes.add(restrict_code);
      trees[restrict_code] = tree;
    }
  }

  restrict_codes.forEach(function(restrict_code){
    try {
      tree = trees[restrict_code];
      var res = new Restriction("Loc", restrict_code, tree.get('sInsp'), tree.get('dtInspDate'));
      location.addRestriction(res);    
    } catch (e) {
      //ok
    }
  });
};



Restriction.checkNotifications = function(tree) {
  for(var i = 0; i < tree.restrictions; i++) {
      if(_.contains(q_notifiy, tree.restrictions[i].restrict_code)) {
        assert(tree.get("sNotification") === "Q");
      }
  }
};

module.exports = Restriction;