const createStore = require('redux').createStore;


/*----------  INITIAL STATE  ----------*/
const initialState = {
  room1: {color : "blue", players: {}},
  room2: {color: "green", players: {}}
};

/*----------  ACTION TYPES  ----------*/
const RECEIVE_GAMESTATE = 'RECEIVE_GAMESTATE';
const UPDATE_COLOR ='UPDATE_COLOR';
const ADD_PLAYER = 'ADD_PLAYER';
const UPDATE_LOCATION = 'UPDATE_LOCATION';

/*----------  ACTION CREATORS  ----------*/
 const receiveGameState = (state, room) => ({
  type: RECEIVE_GAMESTATE, room,
  state
});

 const updateColor = (color, room) => ({
  type: UPDATE_COLOR, room,
  color
});

 const addPlayer = ({id, x, y, z, rx, ry, rz}, room) => ({
  type: ADD_PLAYER,
  id,
  x,
  y,
  z,
  rx,
  ry,
  rz
});

const updateLocation = ({id, x, y, z, rx, ry, rz}, room) => ({
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
const reducer = (state = initialState, action) => {
  let room = {}, player = {};
  let newState, players;
      //console.log(action.type)
  switch (action.type) {
    case RECEIVE_GAMESTATE:  action.state;
    case UPDATE_COLOR: 
    	room = Object.assign({}, state[action.room], {color: action.color});
    	newState = Object.assign({}, state);
    	newState[action.room] = room; 
    	return newState;
    case ADD_PLAYER:
    case UPDATE_LOCATION:
      player = {};
      player[action.id] = {x: action.x, y: action.y, z: action.z, rx: action.rx, ry: action.ry, rz: action.rz};
      players = Object.assign({}, state[action.room].players, player);
      room = Object.assign({}, state[action.room], {players});
      newState = Object.assign({}, state);
      newState[action.room] = room;
      console.log(newState)
      return newState;
    // case UPDATE_LOCATION:
    //   player = {};
    //   player[action.id] = {x: action.x, y: action.y, z: action.z, rx: action.rx, ry: action.ry, rz: action.rz};
    //   players = Object.assign({}, state[action.room].players, player);
    //   room = Object.assign({}, state[action.room], {players});
    //   newState = Object.assign({}, state);
    //   newState[action.room] = room;
    //   console.log(newState)
    //   return newState;
    default: return state;

  }
};

module.exports = createStore(reducer);













