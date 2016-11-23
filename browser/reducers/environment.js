/*----------  INITIAL STATE  ----------*/
const initialState = 'red';


/*----------  ACTION TYPES  ----------*/

const SET_COLOR = 'SET_COLOR';

/*----------  ACTION CREATORS  ----------*/
export const addUser = color => ({
  type: SET_COLOR,
  color
});


/*----------  THUNK CREATORS  ----------*/


/*----------  REDUCER  ----------*/
export default (state = initialState, action) => {
  switch (action.type) {
    case SET_COLOR:
      return Object.assign({}, state, { color: action.color });
    default: return state;
  }
};
