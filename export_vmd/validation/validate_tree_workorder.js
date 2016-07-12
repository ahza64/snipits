var util = require('dsp_shared/lib/cmd_utils');
util.connect(["meteor"]);

var Workorder = require('dsp_shared/database/model/workorders');

function *validateTreeWorkorders() {
  return Workorder.checkTreeCount();
}

module.exports = { validateTreeWorkorders: validateTreeWorkorders };
