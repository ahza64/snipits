var auth = function*(next) {
  if(this.isAuthenticated()) {
    this.user = this.passport.user;
    yield next;
  } else {
    this.throw(401);
  }
};

module.exports = auth;