/* -------- ACTION TYPES  ---------*/

// const IS_DISPLAYED = 'IS_DISPLAYED';
const START_GAME = 'START_GAME';
const STOP_GAME = 'STOP_GAME';
const START_CHAT = 'START_CHAT';
const STOP_CHAT = 'STOP_CHAT';
const SET_ERROR = 'SET_ERROR';
const SET_NICKNAME = 'SET_NICKNAME';
const SET_WORLD = 'SET_WORLD';
const RESET_ERROR = 'RESET_ERROR';
const HIDE_INSTRUCTIONS = 'HIDE_INSTRUCTIONS';
const LOSE = 'LOSE';
const CONTINUE = 'CONTINUE';
const ATE = 'ATE';
const FELL = 'FELL';
const INITIALIZED = 'INITIALIZED';

/*= ------ACTION CREATORS-------*/

const initialState = {
  isPlaying: false,
  isChatting: false,
  nickname: '',
  world: '',
  status: '',
  error: null,
  isInitialized: false,
};

export const startGame = () => ({
  type: START_GAME,
});

export const stopGame = () => ({
  type: STOP_GAME,
});

export const initialized = () => ({
  type: INITIALIZED,
});

export const startChat = () => ({
  type: START_CHAT,
});

export const stopChat = () => ({
  type: STOP_CHAT,
});

export const setNickname = (text) => ({
  type: SET_NICKNAME,
  text,
});

export const setWorld = (text) => ({
  type: SET_WORLD,
  text,
});

export const setError = (error) => ({
  type: SET_ERROR,
  error,
});

export const resetError = () => ({
  type: RESET_ERROR,
});

export const hideInstructions = () => ({
  type: HIDE_INSTRUCTIONS,
});

export const lose = (eater) => ({
  type: LOSE,
  eater: eater.length > 15 ? `${eater.slice(0, 14)}...` : eater,
});

export const keepPlaying = () => ({
  type: CONTINUE,
});

export const fell = (world) => ({
  type: FELL,
  world,
});

export const ateSomeone = (eaten) => ({
  type: ATE,
  eaten: eaten.length > 15 ? `${eaten.slice(0, 14)}...` : eaten,
});

/* ----------  THUNK CREATORS  ----------*/
export const startAsGuest = (nickname, socket) => (dispatch) => {
  if (nickname) {
    socket.emit('start_as_guest', { nickname });
    dispatch(resetError());
  } else {
    dispatch(setError('Please enter a nickname'));
  }
};

export const focusOnChat = (node) => (dispatch) => {
  node.focus();
  dispatch(startChat());
};

export const unfocusChat = (node) => (dispatch) => {
  node.blur();
  dispatch(stopChat());
};

/* -------REDUCER------------*/

export default (state = initialState, action) => {
  switch (action.type) {
    case START_GAME:
      return { ...state, isPlaying: true };
    case STOP_GAME:
      return { ...state, isPlaying: false };
    case START_CHAT:
      return { ...state, isChatting: true };
    case STOP_CHAT:
      return { ...state, isChatting: false };
    case SET_ERROR:
      return { ...state, error: action.error };
    case RESET_ERROR:
      return { ...state, error: null };
    case SET_NICKNAME:
      return { ...state, nickname: action.text };
    case SET_WORLD:
      return { ...state, world: action.text };
    case HIDE_INSTRUCTIONS:
      return { ...state, instructionsHidden: true };
    case LOSE:
      return { ...state, status: `${action.eater} rolled you up` };
    case FELL:
      return { ...state, status: `you left ${action.world.name}'s orbit` };
    case CONTINUE:
      return { ...state, status: '' };
    case ATE:
      return { ...state, status: `you rolled up ${action.eaten}` };
    case INITIALIZED:
      return { ...state, isInitialized: true };
    default:
      return state;
  }
};
