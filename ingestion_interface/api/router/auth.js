// Module
const koa = require('koa');
const router = require('koa-router')();
const passport = require('koa-passport');
const LocalStrategy = require('passport-local').Strategy;

// Collection
const Users = require('dsp_shared/database/model/ingestion/tables').users;
const Companies = require('dsp_shared/database/model/ingestion/tables').companies;

// App
const app = koa();

// Passport
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  Users.findOne({
    where: {
      id: user.id,
      status: 'active'
    },
    raw: true
  }).then(user => {
    done(null, user);
  }).catch(err => {
    done({error: err}, false);
  });
});

passport.use(new LocalStrategy({ usernameField: 'email' }, function(email, password, done) {
  Users.findOne({
    where: {
      email: email,
      status: 'active'
    },
    raw: true,
    include: [Companies]
  }).then(user => {
    if(user) {
      var isAuthenticated = Users.build(user).validPassword(password);
      if (isAuthenticated) {
        done(null, user);
      } else {
        done(null, false);
      }
    }
  }).catch(err => {
  console.log("errerererere", err);
    done(new Error(err), false);
  });
}));

// Router
router.post('/login', passport.authenticate('local', {}), function*() {
  this.body = this.passport.user;
  console.log('response login: ', this.body);
});

router.get('/logout', function*() {
  this.logout();
  this.body = true;
});

app.use(router.routes());

module.exports = app;
