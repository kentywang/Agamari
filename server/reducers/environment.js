let newState;

/*----------  INITIAL STATE  ----------*/
const initialState = {};


/*----------  ACTION TYPES  ----------*/
const ADD_ROOM = 'ADD_ROOM';
const SET_COLOR = 'SET_COLOR';

/*----------  ACTION CREATORS  ----------*/
module.exports.addRoom = name => ({
  type: ADD_ROOM,
  name
});

module.exports.addUser = color => ({
  type: SET_COLOR,
  color
});


/*----------  THUNK CREATORS  ----------*/


/*----------  REDUCER  ----------*/
module.exports.reducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_ROOM:
      newState = Object.assign({}, state);
      newState[action.name] = {};
      return newState;
    case SET_COLOR:
      newState = Object.assign({}, state, { color: action.color });
      return newState;
    default: return state;
  }
};
