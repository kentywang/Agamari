/*-------- ACTION TYPES  ---------*/

//const IS_DISPLAYED = 'IS_DISPLAYED';
const START_GAME ='START_GAME';
const STOP_GAME = 'STOP_GAME';
const SET_ERROR = 'SET_ERROR';
const SET_NICKNAME = 'SET_NICKNAME';
const RESET_ERROR = 'RESET_ERROR';
const HIDE_INSTRUCTIONS = 'HIDE_INSTRUCTIONS';


/*=------ACTION CREATORS-------*/

const initialState = {
  isPlaying: false,
  nickname: '',
  error: null };


export const startGame = () => ({
  type: START_GAME,
});

export const stopGame = () => ({
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

export const hideInstructions = () => ({
  type: HIDE_INSTRUCTIONS
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
    case START_GAME:
    	return Object.assign({}, state, {isPlaying: true});
    case STOP_GAME:
    	return Object.assign({}, state, {isPlaying: false});
		case SET_ERROR:
			return Object.assign({}, state, { error: action.error });
		case RESET_ERROR:
			return Object.assign({}, state, { error: null });
    case SET_NICKNAME:
    return Object.assign({}, state, { nickname: action.text });
    case HIDE_INSTRUCTIONS:
    return Object.assign({}, state, { instructionsHidden: true });
   	default:
   	return state;
  }
}
