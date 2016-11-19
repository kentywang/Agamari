/*----------  INITIAL STATE  ----------*/
const initialState = {color: "red", players: {}};

/*----------  ACTION TYPES  ----------*/
const RECEIVE_GAMESTATE = 'RECEIVE_GAMESTATE';
const UPDATE_COLOR = 'UPDATE_COLOR';
const ADD_PLAYER = 'ADD_PLAYER';
const UPDATE_LOCATION = 'UPDATE_LOCATION';

/*----------  ACTION CREATORS  ----------*/
export const receiveGameState = state => ({
  type: RECEIVE_GAMESTATE,
  state
});

export const updateColor = color => ({
  type: UPDATE_COLOR,
  color
});

export const addPlayer = (player) => ({
  type: ADD_PLAYER,
  player
});

export const updateLocation = (player) => ({
  type: UPDATE_LOCATION,
  player
});

/*----------  THUNK CREATORS  ----------*/

/*----------  REDUCER  ----------*/
export default (state = initialState, action) => {
let newState, players;

  switch (action.type) {
    case RECEIVE_GAMESTATE: return action.state;
    case UPDATE_COLOR:
      return Object.assign({}, state, { color: action.color });
    case ADD_PLAYER:
      players = Object.assign({}, state.players, action.player);
      newState = Object.assign({}, state, {players});
      newState.players = players;
      return newState;
    case UPDATE_LOCATION:
      players = Object.assign({}, state.players, action.player);
      newState = Object.assign({}, state, {players});
      return newState;
    default: return state;
  }
};
