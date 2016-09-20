var vmd = require('dsp_shared/lib/pge_vmd_codes');
var util = require('dsp_shared/lib/cmd_utils');
var _ = require('underscore');

//connect to database and schema
util.connect(["meteor"]);
var TREE = require('dsp_shared/database/model/tree');

function *fixBadSpecies() {
  var updated = yield TREE.update({species: "Montaray Pin"}, {species: "Monterey Pine"});
  console.log("Fixed Montaray Pin", updated);
}

function *getBadSpecies(fix){
  if(fix) {
    yield fixBadSpecies();
  }
  var originalSpecies = vmd.tree_types;
  var correctSpecies = Object.keys(originalSpecies);
  var badSpecies = [];
  var species = yield TREE.distinct('species', {});
  _.each(species, function(specie){
    if(!_.contains(correctSpecies, specie)){
      badSpecies.push(specie);
    }
  });

  return badSpecies;
}

//baker module
if (require.main === module) {
 var baker = require('dsp_shared/lib/baker');
 util.bakerGen(getBadSpecies, {default:true});
 baker.run();
}

module.exports = {
  getBadSpecies: getBadSpecies
};
