import { emit } from './user';

/*----------  INITIAL STATE  ----------*/
const initialState = {
  isOpen: true,
  mode: 'guest',
  nickname: '',
  email: '',
  password: '',
  error: null };

/*----------  ACTION TYPES  ----------*/
const OPEN_CONSOLE = 'OPEN_CONSOLE';
const CLOSE_CONSOLE = 'CLOSE_CONSOLE';
const SET_MODE = 'SET_MODE';
const SET_NICKNAME = 'SET_NICKNAME';
const SET_EMAIL = 'SET_EMAIL';
const SET_PASSWORD = 'SET_PASSWORD';
const SET_ERROR = 'SET_ERROR';
const RESET_ERROR = 'RESET_ERROR';

/*----------  ACTION CREATORS  ----------*/
export const openConsole = () => ({
  type: OPEN_CONSOLE
});

export const closeConsole = () => ({
  type: CLOSE_CONSOLE
});

export const setMode = mode => ({
  type: SET_MODE,
  mode
});

export const setNickname = text => ({
  type: SET_NICKNAME,
  text
});

export const setEmail = text => ({
  type: SET_EMAIL,
  text
});

export const setPassword = text => ({
  type: SET_PASSWORD,
  text
});

export const setError = error => ({
  type: SET_ERROR,
  error
});

export const resetError = () => ({
  type: RESET_ERROR
});


/*----------  THUNK CREATORS  ----------*/

export const startAsGuest = nickname => dispatch => {
  if (nickname) {
    emit('start_as_guest', { nickname });
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
    case SET_MODE:
      return Object.assign({}, state, {mode: action.mode});
    case SET_NICKNAME:
      return Object.assign({}, state, {nickname: action.text});
    case SET_EMAIL:
      return Object.assign({}, state, {email: action.text});
    case SET_PASSWORD:
      return Object.assign({}, state, {password: action.text});
    case SET_ERROR:
      return Object.assign({}, state, { error: action.error });
    case RESET_ERROR:
      return Object.assign({}, state, { error: null });
    default: return state;
  }
};
