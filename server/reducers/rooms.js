let newState, idx;
const store = require('../store');
const roomNames = require('../room-names');
const { difference, random } = require('lodash');

/*----------  INITIAL STATE  ----------*/
const initialState = [];


/*----------  ACTION TYPES  ----------*/
const ADD_ROOM = 'ADD_ROOM';
const REMOVE_ROOM = 'REMOVE_ROOM';

/*----------  ACTION CREATORS  ----------*/

const addRoom = name => ({
  type: ADD_ROOM,
  name
});

module.exports.addRoom = addRoom;

module.exports.removeRoom = name => ({
  type: REMOVE_ROOM,
  name
});


/*----------  THUNK CREATORS  ----------*/

/*----------  REDUCER  ----------*/
module.exports.reducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_ROOM:
      if (state.indexOf(action.name) === -1) return [...state, action.name];
      else return state;
    case REMOVE_ROOM:
      idx = state.indexOf(action.name);
      if (idx + 1) {
        newState = [...state];
        newState.splice(idx, 1);
        return newState;
      } else {
        return state;
      }
    default: return state;
  }
};
