/* ----------  INITIAL STATE  ----------*/
const initialState = {
  nickname: '',
  error: null,
};

/* ----------  ACTION TYPES  ----------*/
const SET_NICKNAME = 'SET_NICKNAME';
const RESET_NICKNAME = 'RESET_NICKNAME';
const SET_ERROR = 'SET_ERROR';
const RESET_ERROR = 'RESET_ERROR';

/* ----------  ACTION CREATORS  ----------*/

export const setNickname = (text) => ({
  type: SET_NICKNAME,
  text,
});

export const resetNickname = () => ({
  type: RESET_NICKNAME,
});

export const setError = (error) => ({
  type: SET_ERROR,
  error,
});

export const resetError = () => ({
  type: RESET_ERROR,
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

/* ----------  REDUCER  ----------*/
export default (state = initialState, action) => {
  switch (action.type) {
    case SET_NICKNAME:
      return { ...state, nickname: action.text };
    case RESET_NICKNAME:
      return { ...state, nickname: '' };
    case SET_ERROR:
      return { ...state, error: action.error };
    case RESET_ERROR:
      return { ...state, error: null };
    default: return state;
  }
};
