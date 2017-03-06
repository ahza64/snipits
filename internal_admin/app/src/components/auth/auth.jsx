// Module
const urlPrefix = require('dsp_shared/conf.d/config.json').admin.url_prefix;
import authRedux from '../../reduxes/auth';
import * as _ from 'underscore';

const roleLib = {
  'DA': ['/companies/', '/projects/', '/configs/', '/users/', '/schemas/', '/schema/', '/taxonomy/', '/taxfields/'],
  'DI': ['/ingest/']
};

// Secure the router based on login and role
var isRouteAuthorized = (nextState, replace) => {
  var user = authRedux.getState();
  var role = user ? user.role : null;

  if (!(user && user.id)) {
    // check if user login
    replace(urlPrefix);
  } else if (!_.contains(roleLib[role], nextState.location.pathname)) {
    // check if role has the rights
    var initRoute = roleLib[role][0].slice(1);
    replace(urlPrefix + initRoute);
  }
};

// Give default route
var getDefaultRoute = () => {
  var user = authRedux.getState();
  var role = user.role;
  var initRoute = roleLib[role][0].slice(1);

  return initRoute;
};

export { isRouteAuthorized, getDefaultRoute };
