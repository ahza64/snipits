// Module
const urlPrefix = require('dsp_shared/conf.d/config.json').mooncake.url_prefix;
import authRedux from '../../reduxes/auth';

// Secure the router based on login and role
var isRouteAuthorized = (nextState, replace) => {
  var user = authRedux.getState();

  if (!(user && user.id)) {
    // check if user login
    replace(urlPrefix);
  }
};

export { isRouteAuthorized };