/**
 * @fileoverview Some tc_user_ids and pi_user_ids are missing.  This tries to fill them in.
 */
const utils = require('dsp_shared/lib/cmd_utils');
utils.connect(['meteor', 'trans']);

const _ = require('underscore');
const Tree = require('dsp_shared/database/model/tree');
const Cuf = require('dsp_shared/database/model/cufs');
const TransTree = require('dsp_shared/database/model/trans/tree');
const TransUser = require('dsp_shared/database/model/trans/user');
const stream = require("dsp_shared/database/stream");

var new_users = [
  {
    _id: "5654db442895a53d28412015",
    uniq_id: "KRD4@pge.com",
    first: "Kurt",
    last: "Dickerson",
    user: "5654db442895a53d28412015",
    vehicle: null,
    work_type: ["tree_inspect"],
    scuf: "Hmm5@pge.com",
    company: "ACRT"    
  },{
    _id: "5654db432895a53d2841200f",    
    uniq_id: "D4GB@pge.com",
    first: "Daniel",
    last: "Gray",
    user: "5654db432895a53d2841200f",
    vehicle: null,    
    work_type: ["tree_inspect"],    
    scuf: "Hmm5@pge.com",
    company: "ACRT"    
  },{
    _id: "5654db452895a53d2841201b",
    uniq_id: "KWSF@pge.com",
    first: "Kirby",
    last: "Schwinck",
    user: "5654db452895a53d2841201b",
    vehicle: null,    
    work_type: ["tree_inspect"],
    scuf: "MPHa@pge.com",
    company: "ACRT"    
  }
];


// var users = {};
var updated_users = {
  "5654db442895a53d28412015": {uniq_id: "KRD4@pge.com"}, //Kurt Dickerson
  "5654db432895a53d2841200f": {uniq_id: "D4GB@pge.com"}, //Daniel Gray
  "5654db452895a53d2841201b": {uniq_id: "KWSF@pge.com"}, //Kirby Schwinck
  "566f4904d45c85303a350ac4": {uniq_id: "T2R7@pge.com"}, //depr_Thomas Rinchiuso
  "56846116d9bfa5c61e038d90": {uniq_id: "C757@pge.com"}  //Chad Stout
};


function *addMissingCufs() {
  for(var i = 0; i < new_users.length; i++) {
    var user = new_users[i];
    var db_user = yield Cuf.findOne({uniq_id: user.uniq_id});
    if(!db_user) {
      console.log("CREATING USER", user);
      yield Cuf.create(user);
    }
  }
}


function *run(fix){  
  var user_field = "pi_user_id";
  var trans_user_field = {
    pi_user_id: "inspector_user",
    tc_user_ids: "trimmer_user"
  }[user_field];
  var query = {status: /^[2345]/};
  query[user_field] = null;

  var count = yield Tree.find(query).count();  
  console.log("Found "+count+" trees missing "+user_field);
  
  
  yield addMissingCufs()
  
  // var user_map = {};
  var missing_users = {};
  for(var tree_p of stream(Tree, query)) {
    var tree = yield tree_p;    
    var trans_tree = yield TransTree.findOne({_id: tree._id});
    // console.log("trans tree", trans_tree._id, !trans_tree)
    var trans_user = null;
    if(trans_tree) {
      trans_user = yield TransUser.findOne({_id: trans_tree[trans_user_field]});

      console.log(tree._id, tree[user_field], trans_tree[trans_user_field]);    
    } else {
      console.error(tree._id, tree[user_field], "NO TRANS TREE FOUND");    
    }
    if(trans_user) {
      missing_users[trans_user._id.toString()] = trans_user;
      

      var cuf = yield Cuf.findOne({uniq_id: updated_users[trans_user._id.toString()].uniq_id});
      
      if(cuf) {
        console.log("updating tree", tree._id, cuf.uniq_id, cuf._id);
        if(fix) {
          tree[user_field] = cuf._id;
          yield tree.save();
        }
      }
    } else {
      console.error(tree._id, tree[user_field], "USER NOT FOUND");
    }
  }
  console.error("Missing users", _.map(missing_users, user => user.email));  
}


//baker module
if (require.main === module) {
  var baker = require('dsp_shared/lib/baker');
  utils.bakerGen(run, { default: true }); 
  baker.run();  
}
