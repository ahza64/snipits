// Module
import authRedux from '../../reduxes/auth';

// Secure the router based on login and role
var isRouteAuthorized = (nextState, replace) => {
  var user = authRedux.getState();
  
  if (!user.id) {
    // check if user login
    replace('/');  
  }
};

export { isRouteAuthorized };