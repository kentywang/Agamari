/*----------  INITIAL STATE  ----------*/
const initialState = [];

/*----------  ACTION TYPES  ----------*/
const RECEIVE_MESSAGES = 'RECEIVE_MESSAGES';
const RECEIVE_MESSAGE = 'RECEIVE_MESSAGE';
const REMOVE_MESSAGE = 'REMOVE_MESSAGE';
const REMOVE_ALL_MESSAGES = 'REMOVE_ALL_MESSAGES';


/*----------  ACTION CREATORS  ----------*/
export const receiveMessages = messages => ({
  type: RECEIVE_MESSAGES,
  messages
});

export const receiveMessage = message => ({
  type: RECEIVE_MESSAGE,
  message
});

export const removeMessage = idx => ({
  type: REMOVE_MESSAGE,
  idx
});

export const removeAllMessages = () => ({
  type: REMOVE_ALL_MESSAGES
});


/*----------  THUNK CREATORS  ----------*/


/*----------  REDUCER  ----------*/
export default (state = initialState, action) => {
  switch (action.type) {
    case RECEIVE_MESSAGES:
      return action.messages;
    case RECEIVE_MESSAGE:
      return [...state, action.message];
    case REMOVE_MESSAGE:
      return state.slice(0, action.idx).concat(state.slice(action.idx + 1));
    case REMOVE_ALL_MESSAGES:
      return initialState;
    default:
      return state;
  }
};
