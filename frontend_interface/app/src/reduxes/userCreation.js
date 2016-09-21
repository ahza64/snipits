/**
 * @fileOverview Reducer for Create a user
 */

import { createStore } from 'redux';

const userCreateReducer = (state = {}, action) => {
  switch(action.type) {
    case 'ADDCOMPANY':
      return action.user;
    case 'ADDUSER':
      return action.user;
    default:
      return {};
  }
};

export default createStore(userCreateReducer);