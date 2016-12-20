// Check user permissions to edit company data
var has = function(user, companyId) {
  var hasPermissions = false;
  if((user) && (user.status === 'active') && (user.companyId == companyId)) {
    hasPermissions = true;
  }
  return hasPermissions;
};

module.exports = { 'has': has };
