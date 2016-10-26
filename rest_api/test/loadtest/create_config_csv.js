var util = require('dsp_shared/lib/cmd_utils');
util.connect(["meteor"]);
var Cuf = require('dsp_shared/database/model/cufs');
var csv = require('dsp_shared/lib/write_csv');


function *createCSV(){
  var data = [];
  var count = 0;
  var query = {
    workorder: {$exists: true},
    work_type: 'tree_trim',
    status: 'active'
  };
  var tc = yield Cuf.find(query);
  for(var i=0; i<tc.length; i++){
    var treeCrew = tc[i];
    console.log(treeCrew._id);
    data.push({
      email: treeCrew.uniq_id,
      password:  treeCrew.phone_number || treeCrew.phone_number[0]
    });
    count++;
  }
  var fields = ['email', 'password'];
  var filename = 'treeCrew.csv';
  csv(fields, data, filename);
  console.log(count);
}

//baker module
if (require.main === module) {
  util.bakerGen(createCSV, {default: true});
  util.bakerRun();
}
