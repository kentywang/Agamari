import { initializeSocket } from '../socket';
import { openConsole } from './controlPanel';
let socket;

/*----------  INITIAL STATE  ----------*/
const initialState = null;

/*----------  ACTION TYPES  ----------*/
const AUTHENTICATED = 'AUTHENTICATED';
const LOGOUT = 'LOGOUT';

/*----------  ACTION CREATORS  ----------*/
export const authenticated = user => ({
  type: AUTHENTICATED,
  user
});

export const clearAuth = () => ({
  type: LOGOUT
});

/*----------  THUNK CREATORS  ----------*/
import axios from 'axios';


export const whoami = (event, ...data) => dispatch =>
    axios.get('api/auth/whoami')
      .then(response => {
        const user = response.data;
        console.log('whoammingI', user);
        if (!Object.keys(user).length) {
          return dispatch(authenticated(null));
        }
        user.id = user.id.toString();
        socket = socket || initializeSocket();
        dispatch(authenticated(user));
        if (event) socket.emit(event, ...data);
      })
      .catch(console.error);

export const login = (email, password) => dispatch =>
    axios.post('api/auth/login', { email, password })
      .then(() => dispatch(whoami('start')))
      .catch(console.error);

export const loginAsGuest = nickname => dispatch =>
    axios.post('api/auth/login/guest', { nickname })
      .then(() => dispatch(whoami('start')))
      .catch(console.error);

export const logout = () => dispatch =>
    axios.get('/api/auth/logout')
      .then(() => {
        dispatch(clearAuth());
        dispatch(openConsole());
      })
      .catch(console.error);

/*----------  SOCKET EVENTS  ----------*/
export const emit = (event, ...data) => {
  socket.emit(event, ...data);
};

/*----------  REDUCER  ----------*/
export default (state = initialState, action) => {
  switch (action.type) {
    case AUTHENTICATED:
      console.log('authenticated', action.user);
      return action.user;
    case LOGOUT:
      return null;
    default: return state;
  }
};
