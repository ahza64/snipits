//Third party module
const co = require('co');

// Dispatchr module
const config = require('dsp_shared/config').get();
require('dsp_shared/database/database')(config.meteor);
const Cuf = require('dsp_shared/database/model/cufs');
const Export = require('dsp_shared/database/model/export');
const Tree = require('dsp_shared/database/model/tree');

module.exports = co.wrap(function*(startTime, endTime) {
  
  var csvData = [];
  var companies = yield Cuf.find().distinct('company');
  
  for (var i = 0; i < companies.length; i++) {
    var crewData = yield Cuf.find({ company: companies[i] });
    var crewType = crewData[0].work_type[0];
    var crewIds = crewData.map(x => x._id);
    var query = {};
    crewType = crewType === 'tree_inspect' ? 'pi' : 'tc';
    var id_key = crewType + '_user_id';
    var time_key = crewType + '_complete_time';
    query[id_key] = { $in: crewIds };
    query[time_key] = { $gt: startTime, $lt: endTime };
    var trees = yield Tree.find(query);

    for (var j = 0; j < trees.length; j++) {
      var tree = trees[j];
      var crew = yield Cuf.findOne({ _id: tree[id_key] });
      var exportData = yield Export.findOne({ tree_id: tree._id });
      var quantity = 0;
      if (tree.comments) {
        quantity = tree.comments.split('#')[1] || 0;
      }

      var temp = {
        // IDs
        _id: tree._id,
        qsi_id: tree.qsi_id,
        external_tree_id: (exportData && exportData.export_tree_id) || 'not exported',
        external_location_id: (exportData && exportData.workorder_id) || 'not exported',
        inc_id: tree.inc_id,

        // PGE
        region: tree.region,
        division: tree.division,
        pge_pmd_num: tree.pge_pmd_num,
        circuit_name: tree.circuit_name,
        span_name: tree.span_name,
        pge_detection_type: tree.pge_detection_type,

        // TREE
        species: tree.species,
        dbh: tree.dbh,
        height: tree.height,
        health: tree.health,
        clearance: tree.clearance,
        trim_code: tree.trim_code,
        
        // LOCATION
        address: tree.address,
        state: tree.state,
        county: tree.county,
        city: tree.city,
        zipcode: tree.zipcode,
        streetName: tree.streetName,
        streetNumber: tree.streetNumber,
        location: tree.location.coordinates,

        // CREW
        company: crew.company,
        crew: crew.name,
        complete_time: tree[time_key],
        comments: tree.comments || '',
        quantity: quantity
      };
      
      csvData.push(temp);
      console.log(temp);
    }
  }

  return csvData;
});