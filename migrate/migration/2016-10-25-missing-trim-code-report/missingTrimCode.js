var util = require('dsp_shared/lib/cmd_utils');
util.connect(["meteor"]);

var Tree = require('dsp_shared/database/model/tree');
var Cuf = require('dsp_shared/database/model/cufs');
var csv = require('dsp_shared/lib/write_csv');

var statusLib = {
  '3': 'not ready',
  '4': 'ready',
  '5': 'worked'
};

function *missingTrimCode(){

  var data = [];
  var query = {
    trim_code: {$exists: false},
    project: 'transmission_2015',
    status: /^[^2106]/,
    $or:[{flagged_not_routine: false}, {flagged_not_routine: {$exists: false}}]
  };
  var count = yield Tree.find(query).count();

  var trees = yield Tree.find(query);
  for(var i = 0; i<trees.length; i++){
    var tree = trees[i];
    var pi = yield Cuf.findById(tree.pi_user_id);

    var tc = yield Cuf.findById(tree.tc_user_id);

    data.push({
      tree_id: tree.inc_id,
      status: statusLib[tree.status.charAt(0)],
      qsi_id: tree.qsi_id || null,
      external_id: tree.qsi_id || tree._id.toString(),
      location: tree.location.coordinates[0] + ', ' + tree.location.coordinates[1],
      pi: (pi && pi.name) || null,
      tc: (tc && tc.name) || null,
      pmd: tree.pge_pmd_num,
      division: tree.division,
      region: tree.region
    });
  }
  var fields = ['tree_id', 'status', 'qsi_id', 'external_id', 'location', 'pi', 'tc', 'pmd', 'division', 'region'];
  var filename = 'missingTrimCodes.csv';
  csv(fields, data, filename);
  console.log(count);
}

//baker module
if (require.main === module) {
  util.bakerGen(missingTrimCode, {default: true});
  util.bakerRun();
}
