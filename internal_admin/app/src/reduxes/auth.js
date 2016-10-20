/**
 * @fileOverview Reducer for login
 */

import { createStore } from 'redux';

const loginReducer = (state = {}, action) => {
  switch(action.type) {
    case 'LOGIN':
      return action.user;
    case 'LOGOUT':
      return {};
    default:
      return {};
  }
};

export default createStore(loginReducer);