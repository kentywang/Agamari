/*----------  INITIAL STATE  ----------*/
const initialState = {};


/*----------  ACTION TYPES  ----------*/

const ADD_USER = 'ADD_USER';
const ASSIGN_WORLD = 'ASSIGN_WORLD';
const UNASSIGN_WORLD = 'UNASSIGN_WORLD';
const REMOVE_USER = 'REMOVE_USER';

/*--------
--  ACTION CREATORS  ----------*/
module.exports.addUser = id => ({
  type: ADD_USER,
  id
});

module.exports.assignWorld = (id, world) => ({
  type: ASSIGN_WORLD,
  id,
  world
});

module.exports.unassignWorld = id => ({
  type: UNASSIGN_WORLD,
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
      newState[action.id] = {world: null};
      return newState;
    case ASSIGN_WORLD:
      user = Object.assign({}, newState[action.id], {world: action.world});
      newState[action.id] = user;
      return newState;
    case UNASSIGN_WORLD:
      user = Object.assign({}, newState[action.id], {world: null});
      newState[action.id] = user;
      return newState;
    case REMOVE_USER:
      delete newState[action.id];
      return newState;
    default: return state;
  }
};
