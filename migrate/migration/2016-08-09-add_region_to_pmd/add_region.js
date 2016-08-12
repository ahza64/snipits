/**
 * @fileoverview This script attempts to add region to pmd 
 */
const utils = require('dsp_shared/lib/cmd_utils');
utils.connect(['meteor']);

const PMD = require('dsp_shared/database/model/pmd');
const stream = require('dsp_shared/database/stream');

const regions = {
  "Sacramento": "North",
  "Sierra": "North",
  "North Bay": "North",
  "North Coast": "North",
  "North Valley": "North",
  "East Bay":	"South",
  "Mission":	"South",
  "Kern":	"South",
  "Los Padres":	"South",
  "Peninsula":	"South",
  "San Jose":	"South",
  "Central Coast":	"South",
  "Fresno":	"South",
  "Stockton":	"South",
  "Yosemite": "South"
};


function *run(fix){  
  var missing_division = yield PMD.find({divsion: null}).count();
  if(missing_division === 0) {
    console.warn("Some PMDs are missing division info and won't be assigned regions", missing_division);
  }
  
  for(var pmd_promise of stream(PMD, {division: {$ne: null}, region: null})) {
    var pmd = yield pmd_promise;
    if(pmd) {
      if(!regions[pmd.division]) {
        console.error("Missing Region for Division", pmd.division);
      } else {
        pmd.region = regions[pmd.division];
        console.log("Setting Region", pmd.name, pmd.pge_pmd_num, pmd.division, pmd.region);
        if(fix) {
          yield pmd.save();
        }
      }    
    }
  }
}


if (require.main === module) {
  utils.bakerGen(run, { default: true }); 
  utils.bakerRun();  
}