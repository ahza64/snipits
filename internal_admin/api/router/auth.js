// Module
const koa = require('koa');
const router = require('koa-router')();
const passport = require('koa-passport');
const LocalStrategy = require('passport-local').Strategy;

// Collection
const Admins = require('dsp_shared/database/model/ingestion/tables').dispatchr_admins;

// App
const app = koa();

// Passport
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  Admins.findOne({
    where: { id: user.id },
    raw: true
  }).then(user => {
    done(null, user);
  }).catch(err => {
    done(err, false);
  });
});

passport.use(new LocalStrategy({ usernameField: 'email' }, function(email, password, done) {
  Admins.findOne({
    where: { email: email },
    raw: true
  }).then(user => {
    var res = false;
    if (user) {
      var isAuthenticated = Admins.build(user).validPassword(password);
      if (isAuthenticated) {
        res = user;
      }
    }
    done(null, res);
  }).catch(err => {
    done(err, false);
  });
}));

// Router
router.post('/login', passport.authenticate('local', {}), function*() {
  console.log('IN AUTH');
  this.body = this.passport.user;
  console.log('response login: ', this.body);
});

router.get('/logout', function*() {
  this.logout();
  this.body = true;
});

app.use(router.routes());

module.exports = app;
