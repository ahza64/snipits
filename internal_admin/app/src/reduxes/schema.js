/**
 * @fileOverview Reducer for
 */

import { createStore } from 'redux';

const schemaReducer = (state = {}, action) => {
  switch(action.type) {
    case 'CHANGE_SCHEMA':
      return action.schema;
    default:
      return ;
  }
};

export default createStore(schemaReducer);
