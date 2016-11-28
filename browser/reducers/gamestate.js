/*-------- ACTION TYPES  ---------*/

//const IS_DISPLAYED = 'IS_DISPLAYED';
const OPEN_GAME ='OPEN_GAME';
const STOP_GAME = 'STOP_GAME';
const SET_ERROR = 'SET_ERROR';
const RESET_ERROR = 'RESET_ERROR';


/*=------ACTION CREATORS-------*/

const initialState = {
  isOpen: false,
  nickname: '',
  error: null };


export const open = () => ({
  type: OPEN_GAME,
});

export const stop = () => ({
  type: STOP_GAME
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

/*-------REDUCER------------*/

export default (state = initialState, action) => {
  switch (action.type) {
    case OPEN_GAME:
    	return Object.assign({}, state, {isOpen: true});
    case STOP_GAME:
    	return Object.assign({}, state, {isOpen: false});
		case SET_ERROR:
			return Object.assign({}, state, { error: action.error });
		case RESET_ERROR:
			return Object.assign({}, state, { error: null });
   	default:
   	return state;
  }
}
