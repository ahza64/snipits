// Module
import authRedux from '../../reduxes/auth';
import * as _ from 'underscore';

var roleAuth = {
  '/upload': ['CU', 'DI', 'DA'],
  '/admin': ['DA'],
  '/ingest': ['DI', 'DA'],
};

roleAuth = Object.freeze(roleAuth);

// Secure the router based on login and role
var isRouteAuthorized = (nextState, replace) => {
  var user = authRedux.getState();
  var curRole = user.role;
  var curLocation = nextState.location.pathname;
  var authRoles = roleAuth[curLocation];
  
  if (!user.id) {
    // check if user login
    replace('/');  
  } else if (!_.contains(authRoles, curRole)) {
    // check if user has the right role authorization
    replace('/upload');
  }
};

// Secure the UI component based on role
var isRoleAuthorized = (action) => {
  var role = authRedux.getState().role;
  return _.contains(roleAuth['/' + action], role);
};

export { isRouteAuthorized, isRoleAuthorized };