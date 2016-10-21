const _ = require('underscore');

var roleAuth = {
  '/company': ['DA'],
  '/user': ['DA'],

};

var auth = function*(next) {
  if(this.isAuthenticated()) {
    this.user = this.passport.user;
    yield next;
  } else {
    this.throw(401);
  }
};

var authRole = function*(next) {
  var role = this.req.user.role;
  var url = this.request.url;
  var roles = roleAuth[url];

  if (_.contains(roles, role)) {
    yield next;
  } else {
    this.throw(401);
  }
};

module.exports = {
  auth: auth,
  authRole: authRole,
};