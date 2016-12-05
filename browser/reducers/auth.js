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

export const logout = () => ({
  type: LOGOUT
});

/*----------  THUNK CREATORS  ----------*/
export const loginGuest = (socket, nickname) => dispatch => {

};

/*----------  REDUCER  ----------*/
export default (state = initialState, action) => {
  switch (action.type) {
    case AUTHENTICATED:
      return action.user;
    case LOGOUT:
      return null;
    default: return state;
  }
};
