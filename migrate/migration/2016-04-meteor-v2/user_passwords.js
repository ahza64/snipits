
var util = require('dsp_tool/util');


var mongoose = require('mongoose');

var connection = require('dsp_model/connections')('meteor');
var CUF = connection.model('cuf', mongoose.Schema({"_id": {type: String}}, {strict:false}));
var User = require("dsp_model/user");
var assert = require('assert');
function *run(fix){
  console.debug("run migration");
  var cufs = yield CUF.find({status: "active", uniq_id: {$ne:"unassigned"}, password: null});
  
  for(var i = 0; i < cufs.length; i++) {
    var cuf = cufs[i];
    var email = cuf.get("uniq_id");
    var phone = cuf.get("phone_number");
    console.log("Looking for user", email);
    var users = yield User.find({email: email, phone_number: phone}).select('password');
    console.log('users', users.length)
    assert(users.length === 1);
    
    var user = users[0];
    console.log("Updating User", email);
    if(fix) {      
      cuf.set("password", user.password);
      yield cuf.save();    
      console.log("success");
    }
  }  
}

if (require.main === module) {
  var baker = require('dsp_tool/baker');
  util.bakerGen(run, {default:true});
  baker.run();
}
