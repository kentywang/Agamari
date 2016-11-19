/*----------  INITIAL STATE  ----------*/
const initialState = {color: "red", players: {}};

/*----------  ACTION TYPES  ----------*/
const RECEIVE_GAMESTATE = 'RECEIVE_GAMESTATE';
const UPDATE_COLOR ='UPDATE_COLOR';
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

export const addPlayer = ({id, x, y, z, rx, ry, rz}) => ({
  type: ADD_PLAYER,
  id,
  x,
  y,
  z,
  rx,
  ry,
  rz
});

export const updateLocation = ({id, x, y, z, rx, ry, rz}) => ({
  type: UPDATE_LOCATION,
  id,
  x,
  y,
  z,
  rx,
  ry,
  rz
});

/*----------  THUNK CREATORS  ----------*/

/*----------  REDUCER  ----------*/
export default (state = initialState, action) => {
let player = {};
let newState, players;

  switch (action.type) {
    case RECEIVE_GAMESTATE: return action.state;
    case UPDATE_COLOR: return Object.assign({},state,{color: action.color});
    case ADD_PLAYER:
    	player = {};
    	player[action.id] = {x: action.x, y: action.y, z: action.z, rx: action.rx, ry: action.ry, rz: action.rz};
    	players = Object.assign({}, state.players, player);
    	newState = Object.assign({}, state);
    	newState.players = players;
    	return newState;
    case UPDATE_LOCATION:
    	player = {};
    	player[action.id] = {x: action.x, y: action.y, z: action.z, rx: action.rx, ry: action.ry, rz: action.rz};
    	players = Object.assign({}, state.players);
      players[action.id] = player;
    	newState = Object.assign({}, state, players);
    	return newState;
    default: return state;

  }
};
