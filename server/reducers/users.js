/*----------  INITIAL STATE  ----------*/
const initialState = {};


/*----------  ACTION TYPES  ----------*/

const ADD_USER = 'ADD_USER';
const ASSIGN_ROOM = 'ASSIGN_ROOM';
const UNASSIGN_ROOM = 'UNASSIGN_ROOM';
const REMOVE_USER = 'REMOVE_USER';

/*--------
--  ACTION CREATORS  ----------*/
module.exports.addUser = id => ({
  type: ADD_USER,
  id
});

module.exports.assignRoom = (id, room) => ({
  type: ASSIGN_ROOM,
  id,
  room
});

module.exports.unassignRoom = id => ({
  type: UNASSIGN_ROOM,
  id
});

module.exports.removeUser = id => ({
  type: REMOVE_USER,
  id
});


/*----------  THUNK CREATORS  ----------*/


/*----------  REDUCER  ----------*/
module.exports.reducer = (state = initialState, action) => {
  let user;
  let newState = Object.assign({}, state);
  switch (action.type) {
    case ADD_USER:
      newState[action.id] = {room: null};
      return newState;
    case ASSIGN_ROOM:
      user = Object.assign({}, newState[action.id], {room: action.room});
      newState[action.id] = user;
      return newState;
    case UNASSIGN_ROOM:
      user = Object.assign({}, newState[action.id], {room: null});
      newState[action.id] = user;
      return newState;
    case REMOVE_USER:
      delete newState[action.id];
      return newState;
    default: return state;
  }
};
