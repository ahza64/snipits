// Module
import authRedux from '../../reduxes/auth';
import * as _ from 'underscore';

var roleAuth = {
  '/create': ['DA'],
  '/ingest': ['DI', 'DA'],
};

roleAuth = Object.freeze(roleAuth);

// Secure the router based on login and role
var isRouteAuthorized = (nextState, replace) => {
  var user = authRedux.getState();
  var curRole = user.role;
  var curLocation = nextState.location.pathname;
  var authRoles = roleAuth[curLocation];
  
  if (!user.id || !_.contains(authRoles, curRole)) {
    replace('/');  
  }
};

// Secure the UI component based on role
var isRoleAuthorizedTo = (action) => {
  var role = authRedux.getState().role;
  return _.contains(roleAuth['/' + action], role);
};

export { isRouteAuthorized, isRoleAuthorizedTo };