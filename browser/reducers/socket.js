/*----------  INITIAL STATE  ----------*/
const initialState = null;

/*----------  ACTION TYPES  ----------*/
const RECEIVE_SOCKET = 'RECEIVE_SOCKET';

/*----------  ACTION CREATORS  ----------*/
export const receiveSocket = socket => ({
  type: RECEIVE_SOCKET,
  socket
});

/*----------  THUNK CREATORS  ----------*/

/*----------  REDUCER  ----------*/
export default (state = initialState, action) => {
  switch (action.type) {
    case RECEIVE_SOCKET: return action.socket;
    default: return state;
  }
};
