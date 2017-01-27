// validate that client isn't sending an alternate company id
var has = function(user, companyId) {
  var hasPermissions = false;
  if((user) && (user.status === 'active') && (user.companyId == companyId)) {
    hasPermissions = true;
  }
  return hasPermissions;
};

module.exports = { 'has': has };
