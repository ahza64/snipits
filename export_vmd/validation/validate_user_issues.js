var util = require('dsp_shared/lib/cmd_utils');
util.connect(["meteor"]);
var _ = require("underscore");
var Tree = require('dsp_shared/database/model/tree');
var Cuf = require('dsp_shared/database/model/cufs');

function *checkTreesMissingUsers() {
  var pi_missing_count = yield Tree.find({project: "transmission_2015", pi_user_id: null, status: /^[2345]/}).count();
  var tc_missing_count = yield Tree.find({project: "transmission_2015", tc_user_id: null, status: /^[5]/}).count();

    
  console.log('Trees missing pi users: ', pi_missing_count);
  console.log('Trees missing tc users: ', tc_missing_count);

  return pi_missing_count === 0 && tc_missing_count === 0;
}

module.exports = { checkTreesMissingUsers: checkTreesMissingUsers };
