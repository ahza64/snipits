// Check user permissions to edit company data
var has = function(user, companyId) {
  var hasPermissions = false;
  if((user.role === 'DA') && (user.status === 'active')) {
    if((user.companyId === null) || (user.companyId === companyId)) {
      hasPermissions = true;
    }
  }
  return hasPermissions;
};

module.exports = { 'has': has };
