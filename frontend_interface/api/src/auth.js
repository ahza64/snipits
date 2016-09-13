const koa = require('koa');
const router = require('koa-router')();
const passport = require('koa-passport');
const LocalStrategy = require('passport-local').Strategy;
const app = koa();

// mock up user
var user = { id: 1, username: 'test', password: 'test'};

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  done(null, user);
});

passport.use(new LocalStrategy(function(username, password, done) {
  // retrieve user ...
  if (username === user.username && password === user.password) {
    done(null, user);
  } else {
    done(null, false);
  }
}));

app.use(passport.initialize());
app.use(passport.session());

router.post('/login', passport.authenticate('local', {}), function* () {
  console.log('Body --> ', this.request.body);
  console.log('Passport --> ', this.passport);
});

app.use(router.routes());

module.exports = app;

if (require.main === module) {
  app.listen(3000);
}
