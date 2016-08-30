var Cuf = require('dsp_shared/database/model/cufs');
var bcrypt = require('bcrypt');

var authMethods = {
  'comparePassword' : function(id, candidatePassword, cb){
    Cuf.findOne({_id:id}).select({password: 1}).exec(function(err, passwordUser){
      if(err) { return cb(err); }
      bcrypt.compare(candidatePassword, passwordUser.password, function(err, isMatch){
        if(err) { return cb(err); }
        cb(null, isMatch);
      });
    });
  }
};

module.exports = authMethods;
