/*----------  INITIAL STATE  ----------*/
const initialState = null;

/*----------  ACTION TYPES  ----------*/
const AUTHENTICATED = 'AUTHENTICATED';
const SET_SOCKET_ID = 'SET_SOCKET_ID';
const LOGOUT = 'LOGOUT';

/*----------  ACTION CREATORS  ----------*/
export const authenticated = user => ({
  type: AUTHENTICATED,
  user
});

export const setSocketId = id => ({
  type: SET_SOCKET_ID,
  id
});

export const logout = () => ({
  type: LOGOUT
});

/*----------  THUNK CREATORS  ----------*/
export const loginGuest = (socket, nickname) => dispatch => {

};

import axios from 'axios';

export const whoami = () => dispatch =>
    axios.get('/auth/whoami')
      .then(response => {
        const user = response.data;
        if (!Object.keys(user).length) {
          return dispatch(authenticated(null));
        }
        dispatch(authenticated(user));
      });

export const login = (email, password) => dispatch =>
    axios.post('/auth/login', { email, password })
      .then(() => dispatch(whoami()));


/*----------  REDUCER  ----------*/
export default (state = initialState, action) => {
  switch (action.type) {
    case AUTHENTICATED:
      return action.user;
    case SET_SOCKET_ID:
      return Object.assign({}, state, { socketId: action.id });
    case LOGOUT:
      return null;
    default: return state;
  }
};
