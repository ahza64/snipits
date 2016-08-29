const log = require('log4js').getLogger('['+__filename+']');
const koa = require('koa');
const router = require('koa-router')();
const session = require('koa-session');
const passport = require('koa-passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('dsp_shared/database/model/cufs');
const app = koa();


passport.serializeUser(function(user, done) {
  done(null, user._id.toString());
});

passport.deserializeUser(function(id, done) {
	done(null, User.findOne({ _id: id }).exec(function(error, user){
		if(error){
      done(error, false);
    } else {
      done(null, user);
    }
  }));
});

passport.use(new LocalStrategy({ usernameField: 'email' }, function(email, password, done) {
  User.findOne({ uniq_id: email, status: 'active' }).exec(function(error, user){
    if(error) {
      done(null, false);
    }
    if(user) {
      User.comparePassword(password, function(error, isMatch){
        if(isMatch) {
          log.info('GOT USER', user);
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
  function *(){
    console.log('IN THE POST METHOD');
    log.info("USER LOG IN", this.passport.user["email"], this.host, this.hostname, "https://"+this.host+"/login");

    this.status = 200;
    this.body = this.passport.user;
    console.log(this.body);
  }
);

router.get('/logout',function (){
  this.logout();
  this.body = "ok";
});

app.use(router.routes());

module.exports = app;
