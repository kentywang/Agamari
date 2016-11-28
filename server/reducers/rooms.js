let newState, idx;

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

const removeRoom = name => ({
  type: REMOVE_ROOM,
  name
});


/*----------  THUNK CREATORS  ----------*/


/*----------  REDUCER  ----------*/
const reducer = (state = initialState, action) => {
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

module.exports = { reducer, addRoom, removeRoom };
