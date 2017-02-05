/**
 * @fileOverview Reducer for
 */

import { createStore } from 'redux';

const projectReducer = (state = {}, action) => {
  switch(action.type) {
    case 'CHANGE_PROJECT':
      return action.value;
    default:
      return ;
  }
};

export default createStore(projectReducer);
