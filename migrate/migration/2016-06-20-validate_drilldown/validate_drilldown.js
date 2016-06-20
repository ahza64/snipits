/**
 * @description Tools for checking if Drilldown collection contains all the projects/lines/cities
 */
var _ = require('underscore');
var util = require('dsp_shared/lib/cmd_utils');
util.connect(['meteor']);
var TREE = require('dsp_shared/database/model/tree');
var DIVISION = require('dsp_shared/database/model/divisions');
var PROJECT = require('dsp_shared/database/model/pmd');

function *validateDrilldown () {
  var query = {
    project: 'transmission_2015'
  };
  var orchardPmds = yield PROJECT.find({type: 'Orchard Maintenance'}, {pge_pmd_num: 1});
  orchardPmds = orchardPmds.map(x => x.pge_pmd_num);
  var queryTrees = {
    pge_pmd_num: {$nin: orchardPmds},
    project: 'transmission_2015'
  };

  // check pmds
  var pmdsInTrees = yield TREE.distinct('pge_pmd_num', queryTrees);
  var pmdsInDivs = yield DIVISION.distinct('project_details.pge_pmd_num', query);
  var diffInPmds = _.difference(pmdsInTrees, pmdsInDivs);
  // check lines
  var linesInTrees = yield TREE.distinct('circuit_name', queryTrees);
  var linesInDivs = yield DIVISION.distinct('line_details.name', query);
  var diffInLines = _.difference(linesInTrees, linesInDivs);
  // check cities
  var citiesInTrees = yield TREE.distinct('city', queryTrees);
  var citiesInDivs = yield DIVISION.distinct('city_details.city', query);
  var diffInCities = _.difference(citiesInTrees, citiesInDivs);

  return {
    pmd: diffInPmds,
    line: diffInLines,
    city: diffInCities
  };
}

// baker module
if (require.main === module) {
  var baker = require('dsp_shared/lib/baker');
  util.bakerGen(validateDrilldown, {default:true});
  baker.run();
}

// export
module.exports = {
  validateDrilldown: validateDrilldown
};