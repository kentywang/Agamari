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

export const addPlayer = (id, data) => ({
  type: ADD_PLAYER,
  id,
  data
});

export const updateLocation = (id, data) => ({
  type: UPDATE_LOCATION,
  id,
  data
});

/*----------  THUNK CREATORS  ----------*/

/*----------  REDUCER  ----------*/
export default (state = initialState, action) => {
let newState, players;
  switch (action.type) {
    case RECEIVE_GAMESTATE: return action.state;
    case UPDATE_COLOR:
      state.color = action.color;
      return state;
    case ADD_PLAYER:
      state.players[action.id] = action.data;
      return state;
    case UPDATE_LOCATION:
      state.players[action.id] = action.data;
      return state;
    default: return state;
  }
};
