// Module
const urlPrefix = require('dsp_shared/conf.d/config.json').admin.url_prefix;
import authRedux from '../../reduxes/auth';
import * as _ from 'underscore';

const roleLib = {
  'DA': ['/create/', '/ingest/', '/users/'],
  'DI': ['/ingest/']
};

// Secure the router based on login and role
var isRouteAuthorized = (nextState, replace) => {
  var user = authRedux.getState();
  var role = user.role;
  
  if (!user.id) {
    // check if user login
    replace(urlPrefix);  
  } else if (!_.contains(roleLib[role], nextState.location.pathname)) {
    // check if role has the rights
    replace(urlPrefix + 'ingest/');
  }
};

export { isRouteAuthorized };