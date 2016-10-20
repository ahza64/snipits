// Module
const koa = require('koa');
const router = require('koa-router')();
const passport = require('koa-passport');
const LocalStrategy = require('passport-local').Strategy;

// Collection
const Users = require('../model/tables').users;
const Companies = require('../model/tables').companies;

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
    where: { id: user.id },
    raw: true
  }).then(user => {
    done(null, user);
  }).catch(err => {
    done(err, false);
  });
});

passport.use(new LocalStrategy({ usernameField: 'email' }, function(email, password, done) {
  Users.findOne({
    where: { email: email }, 
    raw: true,
    include: [Companies]
  }).then(user => {
    if (user.password === password) {
      done(null, user);
    } else {
      done(null, false);
    }
  }).catch(err => {
    done(err, false);
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