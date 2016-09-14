var mongoose = require('mongoose');
var co = require('co');
var connection = require('dsp_database/connections')('platform');

var userSchema = new mongoose.Schema({
  company: String,
  name: String,
  email: String,
  user_id: String,
  password: String
});

userSchema.methods.passwordMatch = co.wrap(function* (candidatePassword, cb) {
  var user;
  try {
    user = yield Users.findOne({ _id: this._id });
    cb(null, user.password === candidatePassword);
  } catch (err) {
    cb(new Error('ERROR when comparing password'), false);
  }
});

const Users = connection.model('users', userSchema);

module.exports = Users;