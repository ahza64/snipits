var bcrypt = require('bcrypt');
var mongoose = require('mongoose');
var connection = require('dsp_database/connections')('meteor');
var crypto = require('crypto');

var usersSchema = new mongoose.Schema({
  _id: {type: String},
  services: Object,
  emails:{type: []},
  profile:{type: {}}  // if you need to update >>> user.markModified('profile');
                      //http://mongoosejs.com/docs/schematypes.html

});

usersSchema.methods.comparePassword = function(candidatePassword, cb) {
  console.log('In Compare Password', candidatePassword);
  var pass256 = crypto.createHash('sha256').update(candidatePassword).digest('hex');
  Users.findOne({ _id: this._id }).select({ services: 1}).exec(function(err, passwordUser) {
    if(err) {
      console.log('Error:', err);
    }
    console.log('passwordUser', passwordUser.services.password.bcrypt);
    bcrypt.compare(pass256 , passwordUser.services.password.bcrypt, function(err, isMatch) {
      if(err) { return cb(err); }
      cb(null, isMatch);
    });
  });
};

const Users = connection.model('USERS', usersSchema);

module.exports =  Users;
