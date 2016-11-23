let { reducerMode } = require('../gameEngine');
let newState;

/*----------  INITIAL STATE  ----------*/
const initialState = {
  room1: {}
};

/*----------  ACTION TYPES  ----------*/
const ADD_ROOM = 'ADD_ROOM';
const RECEIVE_PLAYERS = 'RECEIVE_PLAYERS';
const RECEIVE_PLAYER = 'RECEIVE_PLAYER';
const UPDATE_PLAYER = 'UPDATE_PLAYER';
const CHANGE_PLAYER_SCALE = 'CHANGE_PLAYER_SCALE';
const REMOVE_PLAYER = 'REMOVE_PLAYER';


/*----------  ACTION CREATORS  ----------*/
module.exports.addRoom = name => ({
  type: ADD_ROOM,
  name
});

module.exports.receivePlayers = (players, room) => ({
  type: RECEIVE_PLAYERS,
  players, room
});

module.exports.receivePlayer = (id, data, room) => ({
  type: RECEIVE_PLAYER,
  id, data, room
});

module.exports.updatePlayer = (id, data, room) => ({
  type: UPDATE_PLAYER,
  id, data, room
});

module.exports.changePlayerScale = (id, change, room) => ({
  type: CHANGE_PLAYER_SCALE,
  id, change, room
});

module.exports.removePlayer = (id, room) => ({
  type: REMOVE_PLAYER,
  id, room
});


/*----------  THUNK CREATORS  ----------*/

/*----------  REDUCER  ----------*/
const immutable = (state = initialState, action) => {
  switch (action.type) {
    case ADD_ROOM:
      newState = Object.assign({}, state);
      newState[action.name] = {};
      return newState;
    case RECEIVE_PLAYERS:
      newState = Object.assign({}, state);
      newState[action.room] = action.players;
      return newState;
    case RECEIVE_PLAYER:
      newState = Object.assign({}, state);
      newState[action.room] = Object.assign({}, newState[action.room]);
      newState[action.room][action.id] = action.data;
      return newState;
    case UPDATE_PLAYER:
      newState = Object.assign({}, state);
      newState[action.room] = Object.assign({}, newState[action.room]);
      newState[action.room][action.id] = Object.assign({}, newState[action.room][action.id], action.data);
      return newState;
    case CHANGE_PLAYER_SCALE:
      newState = Object.assign({}, state);
      newState[action.room] = Object.assign({}, newState[action.room]);
      newState[action.room][action.id] = Object.assign({}, newState[action.room][action.id], {scale: newState[action.room][action.id].scale + action.change});
      return newState;
    case REMOVE_PLAYER:
      newState = Object.assign({}, state);
      newState[action.room] = Object.assign({}, newState[action.room]);
      delete newState[action.room][action.id];
      return newState;
    default: return state;
  }
};


const semimutable = (state = initialState, action) => {
  switch (action.type) {
    case ADD_ROOM:
      newState = Object.assign({}, state);
      newState[action.name] = {};
      return newState;
    case RECEIVE_PLAYERS:
      newState = Object.assign({}, state);
      newState[action.room] = action.players;
      return newState;
    case RECEIVE_PLAYER:
      newState = Object.assign({}, state);
      newState[action.room][action.id] = action.data;
      return newState;
    case UPDATE_PLAYER:
      newState = Object.assign({}, state);
      Object.assign(newState[action.room][action.id], action.data);
      return newState;
    case CHANGE_PLAYER_SCALE:
      newState = Object.assign({}, state);
      newState[action.room][action.id].scale += action.change;
      return newState;
    case REMOVE_PLAYER:
      newState = Object.assign({}, state);
      delete newState[action.room][action.id];
      return newState;
    default: return state;
  }
};


const mutable = (state = initialState, action) => {
  switch (action.type) {
    case ADD_ROOM:
      state[action.name] = {};
      return state;
    case RECEIVE_PLAYERS:
      state[action.room] = action.players;
      return state;
    case RECEIVE_PLAYER:
      state[action.room][action.id] = action.data;
      return state;
    case UPDATE_PLAYER:
    Object.assign(state[action.room[action.id]], action.data);
      return state;
    case CHANGE_PLAYER_SCALE:
      state[action.room][action.id].scale += action.change;
      return state;
    case REMOVE_PLAYER:
      delete state[action.room][action.id];
      return state;
    default: return state;
  }
};

const chooseReducer = reducerMode => {
  switch (reducerMode) {
    case 'mutable': return mutable;
    case 'semimutable': return semimutable;
    case 'immutable': return immutable;
    default: return mutable;
  }
};

module.exports.reducer =  chooseReducer(reducerMode);
