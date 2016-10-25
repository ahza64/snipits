const log = require('dsp_shared/config/config').get().getLogger('['+__filename+']');
const koa = require('koa');
const router = require('koa-router')();
const passport = require('koa-passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('dsp_shared/database/model/cufs');
const _ = require('underscore');
const app = koa();
const config = require('../routes_config').auth.exclude;

//limit the fields attached to user
var select = {};
_.each(config, field => {
  select[field] = 0;
});

passport.serializeUser(function(user, done) {
  done(null, user._id.toString());
});

passport.deserializeUser(function(id, done) {
	done(null, User.findOne({ _id: id }).select(select).exec(function(error, user){
		if(error){
      done(error, false);
    } else {
      done(null, user);
    }
  }));
});

passport.use(new LocalStrategy({ usernameField: 'email' }, function(email, password, done) {

  User.findOne({ uniq_id: email, status: 'active' }).select(select).exec(function(error, user){
    if(error) {
      done(null, false);
    }
    if(user) {
      user.comparePassword(password, function(error, isMatch){
        if(error) {
          log.error('Error:', error);
        }
        if(isMatch) {
          return done(null, user);
        }
        return done(null, false);
      });
    } else {
      return done(null, false);
    }
  });
}));

app.use(passport.initialize());
app.use(passport.session());

router.post('/login',
  passport.authenticate('local', {}),
  function *() {
    log.info("USER LOG IN", this.passport.user.uniq_id, this.host, this.hostname, "https://"+this.host+"/api/v3/login");
    var log_me = {
      method: this.method,
      id: this.id,
      host: this.request.host,
      url: this.originalUrl,
      body: this.request.body,
      user: this.passport.user,
      "user-agent": this.request.header['user-agent']
    };
    log.info(log_me);
    this.status = 200;
    this.body = this.passport.user;
  }
);

router.get('/logout',function (){
  this.session = null;
  this.logout();
  this.dsp_env.msg = 'Successfully Logged Out!!!';
  this.dsp_env.status = 200;
  this.status = 200;
});

app.use(router.routes());
module.exports = app;
