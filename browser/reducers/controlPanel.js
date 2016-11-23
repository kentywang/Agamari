/*----------  INITIAL STATE  ----------*/
const initialState = {
  isOpen: true,
  nickname: '',
  error: null };

/*----------  ACTION TYPES  ----------*/
const OPEN_CONSOLE = 'OPEN_CONSOLE';
const CLOSE_CONSOLE = 'CLOSE_CONSOLE';
const SET_NICKNAME = 'SET_NICKNAME';
const RESET_NICKNAME = 'RESET_NICKNAME';
const SET_ERROR = 'SET_ERROR';
const RESET_ERROR = 'RESET_ERROR';

/*----------  ACTION CREATORS  ----------*/
export const openConsole = () => ({
  type: OPEN_CONSOLE
});

export const closeConsole = () => ({
  type: CLOSE_CONSOLE
});

export const setNickname = text => ({
  type: SET_NICKNAME,
  text
});

export const resetNickname = () => ({
  type: RESET_NICKNAME
});

export const setError = error => ({
  type: SET_ERROR,
  error
});

export const resetError = () => ({
  type: RESET_ERROR
});


/*----------  THUNK CREATORS  ----------*/

export const startAsGuest = (nickname, socket) => dispatch => {
  if (nickname) {
    socket.emit('start_as_guest', { nickname });
    dispatch(resetError());
  } else {
    dispatch(setError('Please enter a nickname'));
  }
};

/*----------  REDUCER  ----------*/
export default (state = initialState, action) => {
  switch (action.type) {
    case OPEN_CONSOLE:
      return Object.assign({}, state, {isOpen: true});
    case CLOSE_CONSOLE:
      return Object.assign({}, state, {isOpen: false});
    case SET_NICKNAME:
      return Object.assign({}, state, {nickname: action.text});
    case RESET_NICKNAME:
      return Object.assign({}, state, {nickname: ''});
    case SET_ERROR:
      return Object.assign({}, state, { error: action.error });
    case RESET_ERROR:
      return Object.assign({}, state, { error: null });
    default: return state;
  }
};
