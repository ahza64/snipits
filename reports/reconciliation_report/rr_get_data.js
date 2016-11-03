//Third party module
const co = require('co');

// Dispatchr module
const config = require('dsp_shared/config').get();
require('dsp_shared/database/database')(config.meteor);
const Cuf = require('dsp_shared/database/model/cufs');
const Export = require('dsp_shared/database/model/export');
const Tree = require('dsp_shared/database/model/tree');

module.exports = co.wrap(function*(startTime, endTime, workType, exportType, company) {
  var csvData = [];
  var findDBTreeCount = 0;
  var foundTreeCount = 0;
  var missExportDataCount = 0;

  // Build Query
  var query = {
    project: 'transmission_2015',
    status: new RegExp('^[^06]'),
    exported: { $exists: true } // Check if the tree got exported
  };
  var crewData = yield Cuf.find({ company: company });
  var crewIds = crewData.map(x => x._id);
  var crewType = workType === 'tree_inspect' ? 'pi' : 'tc';
  var id_key = crewType + '_user_id';
  var time_key = crewType + '_complete_time';
  query[id_key] = { $in: crewIds };
  query[time_key] = { $gt: startTime, $lt: endTime };
  var trees = yield Tree.find(query);
  findDBTreeCount += trees.length;

  // Loop Results
  for (var j = 0; j < trees.length; j++) {
    foundTreeCount++;
    var tree = trees[j];
    var crew = yield Cuf.findOne({ _id: tree[id_key] });
    var exportData = yield Export.findOne({ tree_id: tree._id, type: exportType });
    // Check if has data in exports collection
    if (!exportData) {
      missExportDataCount++;
      continue;
    }
    var quantity = 0;
    if (tree.comments) {
      var matches = tree.comments.match(/#([0-9]+)#/);
      quantity = matches ? matches[1] : 0;
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
      tc_overtime: tree.tc_overtime || '',
      complete_time: tree[time_key],
      comments: tree.comments || '',
      quantity: quantity
    };

    csvData.push(temp);
    console.log(temp._id, temp.company, temp.quantity);
  }

  console.log('===============================');
  console.log('company: ', company);
  console.log('DB Find: ', findDBTreeCount);
  console.log('Found: ', foundTreeCount);
  console.log('Excluded: ', missExportDataCount);
  console.log('CSV: ', csvData.length);

  return csvData;
});