const util = require('dsp_shared/lib/cmd_utils');
util.connect(["meteor"]);
const config = require('./config.json');

function *cleanup(model){
  var Model = require('dsp_shared/database/model/' + model);
  var query = config[model].query;
  var delete_fields = config[model].delete_fields;
  var count = yield Model.find().count();
  var data = yield Model.update(query, {$unset: delete_fields}, {multi: true});
  console.info('TOTAL DOCUMENTS: ', count);
  console.info('QUERY: ', query, delete_fields);
  console.info('UPDATED: ', data);
}

//baker module
if (require.main === module) {
  util.bakerGen(cleanup);
  util.bakerRun();
}
