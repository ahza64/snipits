/**
 * we are collecting trim codes from users in a spread sheet.  This script reads the csv files and updates the trees in the database.
 */

var utils = require('dsp_shared/lib/cmd_utils');
utils.connect(['meteor', 'postgres']);

var TreeHistory = require("dsp_shared/database/model/tree-history");
var Tree = require("dsp_shared/database/model/tree");
var stream_csv = require('dsp_shared/lib/stream_csv');
var vmd = require("dsp_shared/lib/pge_vmd_codes");
var assert = require("assert");

const STATUS_INDEX = 1;
const STATUS_NO_TRIM = '2';

String.prototype.replaceAt=function(index, character) {
    character = character.toString();
    return this.substr(0, index) + character + this.substr(index+character.length);
};


function* run(csv_file, fix) {
  for(var update of stream_csv(csv_file)) {
    update  = yield update;
    if(update) {
      // console.log('update', update);
      if(update.qsi_id) {
        var tree = yield Tree.findOne({qsi_id: update.qsi_id});
      } else {
        // console.log("Looking for extrenal id", update.external_id)
        tree = yield Tree.findOne({_id: update.external_id});
      }      
      var trim_code = update.trim_code;
      
      var do_update = true;
      // console.log("TREE", update.external_id, tree._id, tree.inc_id, tree.status, tree.trim_code);
      var oldTree = JSON.parse(JSON.stringify(tree));
      if(trim_code === 'no_trim') {
        
        if(tree.status[1] === STATUS_NO_TRIM) {
          do_update = false;
          console.warn("NOT UPDATING NO TRIM", tree.status[1], '==>', STATUS_NO_TRIM);
        } else {
          tree.status = tree.status.replaceAt(STATUS_INDEX, STATUS_NO_TRIM);        
          console.log("SETTING NO TRIM", tree.status[1], '==>', STATUS_NO_TRIM);
        }                
      } else if(trim_code !== '') {
        assert(vmd.trim_codes[trim_code], "No known trim code: "+trim_code);        
        if(tree.trim_code === trim_code) {
          do_update = false;
          console.log("NOT UPDATING TRIMCODE", tree.trim_code, '==>', trim_code);  
        } else {
          console.log("SETTING TRIMCODE", tree.trim_code, '==>', trim_code);
          tree.trim_code = trim_code;
        }
      } else {
        do_update = false;
      }
      
      var mig_user = {_id: 'csv_trim_code_ingest', type:"Migration"};
      if(fix && do_update) {
        yield tree.save();
        yield TreeHistory.recordTreeHistory(oldTree, tree, mig_user, new Date(), 'csv_trim_code_ingest');
      } 
    }
  }
}

if (require.main === module) {
  utils.bakerGen(run);
  utils.bakerRun();
}