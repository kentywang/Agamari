let newState;

/*----------  INITIAL STATE  ----------*/
const initialState = {};


/*----------  ACTION TYPES  ----------*/
const SET_COLOR = 'SET_COLOR';

/*----------  ACTION CREATORS  ----------*/
module.exports.addUser = color => ({
  type: SET_COLOR,
  color
});


/*----------  THUNK CREATORS  ----------*/


/*----------  REDUCER  ----------*/
module.exports.reducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_COLOR:
      return Object.assign({}, state, { color: action.color });
    default: return state;
  }
};
