var bcrypt = require('bcrypt');
var mongoose = require('mongoose');
var connection = require('dsp_database/connections')('meteor');

var cufSchema = new mongoose.Schema({
  _id:{type: String},
  vehicle:{type:String, index: true},
  name:{type:String, index: true},
  first:{type:String, index: true},
  last:{type:String, index: true},
  user:{type:String, index: true},
  uniq_id:{type:String, index: true},
  project:[],
  work_type: [],
  scuf:{type:String, index: true},
  phone_number:{type:String, index: true},
  status:{type:String, index: true},
  company: {type: String},
  workorder: [],
  password: String,
  last_sent_at: {type: Date}
});

cufSchema.methods.comparePassword = function(candidatePassword, cb) {
  //get a user object with password here
  Cuf.findOne({ _id: this._id }).select({ password: 1 }).exec(function(err, passwordUser){
    if (err) {
      console.log('error:', err);
      return cb(err);
    }
    bcrypt.compare(candidatePassword, passwordUser.password, function(err, isMatch) {
      if (err) { return cb(err); }
      cb(null, isMatch);
    });
  });
};

const Cuf = connection.model('CUFS', cufSchema);

module.exports = Cuf;
