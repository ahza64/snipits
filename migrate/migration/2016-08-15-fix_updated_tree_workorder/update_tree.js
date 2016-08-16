/**
 * @fileoverview There is a set of 214 trees that are missing PMD numbers but are not part of a transmission projects.  
 * This is special migration to mark these trees as ignored and add a comment to say why.
 */


var utils = require('dsp_shared/lib/cmd_utils');
utils.connect(['meteor', 'postgres']);

const Tree = require('dsp_shared/database/model/tree');
const stream = require('dsp_shared/database/stream');
const Workorder = require('dsp_shared/database/model/workorders');

// String.prototype.replaceAt=function(index, character) {
//     return this.substr(0, index) + character + this.substr(index+character.length);
// };

var workorders_by_tree = {};
var workorders_by_uniq = {};

function updateWOIndex(wo, verbose) {
  for(var i = 0; i < wo.tasks.length; i++) {
    var tree_id = wo.tasks[i].toString();
    if(verbose && workorders_by_tree[tree_id]) {
      console.error( "Duplicate Tree Found", tree_id);
    }
    workorders_by_tree[tree_id] = wo;
    workorders_by_uniq[wo.uniq_id] = wo;
  }
}


function *run(fix) {
  var count = yield Workorder.find().count();
  console.log("Loading Workorders", count);
  for(var wop of stream(Workorder)) {
    var wo = yield wop;    
    if(wo) {
      updateWOIndex(wo, true);
    }
  }
  console.log("Workorders Loaded");
  
  
  var query = {status: /^[1-5]/};
  var i = 0;
  count = yield Tree.find(query).count();
  console.log("Checking Trees:", count);
  for(var treep of stream(Tree, query)) {
    var tree = yield treep;
    if(tree) {      
      if(i++ % 10000 === 0) {
        console.log("Tree Count", i, "of", count);
      }
      
      var uniq_id = Workorder.getUniqId(tree);
      wo = workorders_by_tree[tree._id.toString()];
      
      if(uniq_id !== wo.uniq_id) {
        var proper_wo = workorders_by_uniq[uniq_id];
        yield adjustTreeWorkorder(tree, wo, proper_wo, fix);
      } 
    }
  }  
}



function *adjustTreeWorkorder(tree, old_wo, new_wo, fix) {
  var trees = yield Tree.find({_id: {$in: old_wo.tasks}});
  var uniq_id = Workorder.getUniqId(tree);
  
  var allTreesMoved = true; 
  for(var i = 0; i < trees.length; i++) {
    if(Workorder.getUniqId(trees[i]) !== uniq_id) {
      allTreesMoved = false;
    }
  }
  
  
  

  if(allTreesMoved && !new_wo) {
    console.log("Move all trees", old_wo.uniq_id, "==>", Workorder.getUniqId(tree));
    new_wo = Workorder.buildWorkorder(tree);
    new_wo.tasks = old_wo.tasks;
    if(fix) {
      yield Workorder.update({_id: old_wo._id}, {$set: new_wo});
    }           
    updateWOIndex(new_wo);
  } else {
    if(!new_wo) {
      new_wo = Workorder.buildWorkorder(tree);    
      if(fix) {
        new_wo = yield Workorder.create(new_wo);
      }
    }
    var idx = old_wo.tasks.indexOf(tree._id.toString());
    old_wo.tasks.splice(idx, 1);
    new_wo.tasks.push(tree._id.toString());
    if(fix) {
      yield old_wo.save();
      yield new_wo.save();
    }
    updateWOIndex(new_wo);
    console.log("Updated Tree", tree._id, old_wo.uniq_id, "==>", Workorder.getUniqId(tree));
  }
  
  
  
  
  
  
}


if (require.main === module) {
  utils.bakerGen(run, {default:true});  
  utils.bakerRun();  
}
