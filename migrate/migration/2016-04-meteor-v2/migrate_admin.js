
var util = require('dsp_tool/util');


var mongoose = require('mongoose');

var profile_override = {
  "access" : [
    "Yosemite",
    "Los Padres",
    "North Bay",
    "Sierra",
    "North Coast",
    "East Bay",
    "Peninsula",
    "Mission",
    "Fresno",
    "San Jose",
    "Kern",
    "Central Coast",
    "Sacramento",
    "North Valley",
    "Stockton"
  ],
  "admin" : true,
  "scuf" : false,
  "foreman": false
};

var connection = require('dsp_model/connections')('meteor');
var User = connection.model('User', mongoose.Schema({
  "_id": {type: String},
}, {strict:false}));

function *run(fix){
  console.debug("run migration");
  var user = yield User.findOne({"emails.address": "admin-trans@dispatchr.co"});
  console.log("GOT USER", user.get("emails"));
  if(fix) {
    console.log("Updating User", user.get("emails"));
    user.set("profile", profile_override);
    yield user.save();
  }
}

if (require.main === module) {
  var baker = require('dsp_tool/baker');
  util.bakerGen(run, {default:true});
  baker.run();
}
