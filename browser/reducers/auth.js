import socket from '../socket';
import { openConsole } from './controlPanel';
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

export const clearAuth = () => ({
  type: LOGOUT
});

/*----------  THUNK CREATORS  ----------*/


import axios from 'axios';


export const whoami = socketId => dispatch =>
    axios.get('/auth/whoami')
      .then(response => {
        const user = response.data;
        if (!Object.keys(user).length) {
          return dispatch(authenticated(null));
        }
        dispatch(authenticated(Object.assign(user, { socketId })));
      })
      .catch(console.error);

export const login = (email, password) => dispatch =>
    axios.post('/auth/login', { email, password })
      .then(() => dispatch(whoami(socket.id)))
      .then(() => socket.emit('start'))
      .catch(console.error);

export const loginAsGuest = nickname => dispatch =>
    axios.post('/auth/login/guest', { nickname })
      .then(() => dispatch(whoami(socket.id)))
      .then(() => {
        console.log('emitting start!')
        socket.emit('start')
      })
      .catch(console.error);

export const logout = () => dispatch =>
    axios.get('/auth/logout')
      .then(() => {
        dispatch(clearAuth());
        dispatch(openConsole());
      })
      .catch(console.error);

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
