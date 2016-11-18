/*----------  INITIAL STATE  ----------*/
const initialState = {color: "red"};

/*----------  ACTION TYPES  ----------*/
const RECEIVE_GAMESTATE = 'RECEIVE_GAMESTATE';
const UPDATE_COLOR ='UPDATE_COLOR';

/*----------  ACTION CREATORS  ----------*/
export const receiveGameState = state => ({
  type: RECEIVE_GAMESTATE,
  state
});

export const updateColor = color => ({
  type: UPDATE_COLOR,
  color
});


/*----------  THUNK CREATORS  ----------*/

/*----------  REDUCER  ----------*/
export default (state = initialState, action) => {
  switch (action.type) {
    case RECEIVE_GAMESTATE: return action.state;
    case UPDATE_COLOR: return Object.assign({},state,{color: action.color});
    default: return state;

  }
};
