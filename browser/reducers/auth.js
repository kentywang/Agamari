/*----------  INITIAL STATE  ----------*/
const initialState = {id: null};

/*----------  ACTION TYPES  ----------*/
const RECEIVE_PLAYER = 'RECEIVE_PLAYER';

/*----------  ACTION CREATORS  ----------*/
export const receivePlayer = id => ({
  type: RECEIVE_PLAYER,
  id
});

/*----------  THUNK CREATORS  ----------*/

/*----------  REDUCER  ----------*/
export default (state = initialState, action) => {
  switch (action.type) {
    case RECEIVE_PLAYER:
      return Object.assign({}, state, {id: action.id});
    default: return state;
  }
};
