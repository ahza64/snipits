/**
 * @fileOverview Reducer for page
 */

import { createStore } from 'redux';

const offset = 5;
const pageReducer = (state = 0, action) => {
  switch(action.type) {
    case 'NEXT':
      return state + offset;
    case 'PREV':
      return state - offset;
    case 'RESET':
      state = 0;
      return state;
    default:
      return state;
  }
};

export default createStore(pageReducer);
