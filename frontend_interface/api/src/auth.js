// Module
const koa = require('koa');
const router = require('koa-router')();
const passport = require('koa-passport');
const LocalStrategy = require('passport-local').Strategy;

// Collection
const Users = require('dsp_shared/database/model/platform/users');

// App
const app = koa();

// Passport
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  Users.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy({ usernameField: 'email' }, function(email, password, done) {
  Users.findOne({ email: email }, function(err, user) {
    if (err) {
      done(err, false);
    } else {
      user.passwordMatch(password, function(err, isMatch) {
        if(isMatch){
          return done(err, user);
        } else {
          return done(err, false);
        }
      });
    }
  });
}));

// Router
router.post('/login', passport.authenticate('local', {}), function*() {
  this.body = this.passport.user;
  console.log('response login: ', this.body);
});

router.get('/logout', function*(next) {
  this.logout();
  this.body = 'ok';
});

app.use(router.routes());

module.exports = app;