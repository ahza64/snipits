const utils = require('dsp_shared/lib/cmd_utils');
utils.connect(['meteor']);
const readCSVFile = require("dsp_shared/lib/read_csv");
const PMD = require('dsp_shared/database/model/pmd');
const _ = require('underscore');
const path = require('path');

function *run(fix) {
  var file_path = path.dirname(__filename)+'/2016 PMD Data.csv';
  console.log("getting data from dir_path", file_path);
  var projects = yield readCSVFile(file_path);
  
  projects = _.indexBy(projects, 'iProjID');
  
  var pmds = yield PMD.find();
  for(var i = 0; i < pmds.length; i++) {
    var pmd = pmds[i];
    var pmd_num = pmd.pge_pmd_num;
    if(pmd_num.endsWith("BLM")) {
      pmd_num = pmd_num.slice(0, pmd_num.length-3);
    }
    if(projects[pmd_num]) {
      var circuit_num = projects[pmd_num].CircuitNum;
      
      if(!circuit_num.startsWith("TRC")) {
        circuit_num = projects[pmd_num].VMD_CircuitNum;
      }
      if(circuit_num === "NULL") {
	circuit_num = null;
      }
      if(pmd.vmd_circuit_num !== circuit_num) {        
        console.log("FOUND CIRCUIT NUM UPDATE", pmd.vmd_circuit_num, circuit_num);
        pmd.vmd_circuit_num = circuit_num;
        if(fix) {
          yield pmd.save()
        }
      }
      
    } else {
      console.error("Can't find PMD number", pmd.pge_pmd_num);  
    }
  }
}
//baker module
if (require.main === module) {
  utils.bakerGen(run, { default: true }); 
  utils.bakerRun();  
}
