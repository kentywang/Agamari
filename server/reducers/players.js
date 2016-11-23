let newState;

/*----------  INITIAL STATE  ----------*/
const initialState = {};

/*----------  ACTION TYPES  ----------*/
const RECEIVE_PLAYERS = 'RECEIVE_PLAYERS';
const RECEIVE_PLAYER = 'RECEIVE_PLAYER';
const ASSIGN_ROOM = 'ASSIGN_ROOM';
const UPDATE_PLAYER = 'UPDATE_PLAYER';
const CHANGE_PLAYER_SCALE = 'CHANGE_PLAYER_SCALE';
const REMOVE_PLAYER = 'REMOVE_PLAYER';


/*----------  ACTION CREATORS  ----------*/

module.exports.receivePlayers = players => ({
  type: RECEIVE_PLAYERS,
  players
});

module.exports.receivePlayer = (id, data) => ({
  type: RECEIVE_PLAYER,
  id,
  data
});

module.exports.assignRoom = (id, room) => ({
  type: ASSIGN_ROOM,
  id,
  room
});

module.exports.updatePlayer = (id, data) => ({
  type: UPDATE_PLAYER,
  id,
  data
});

module.exports.changePlayerScale = (id, change) => ({
  type: CHANGE_PLAYER_SCALE,
  id, change
});

module.exports.removePlayer = id => ({
  type: REMOVE_PLAYER,
  id
});


/*----------  THUNK CREATORS  ----------*/

/*----------  REDUCER  ----------*/
const immutable = (state = initialState, action) => {
  switch (action.type) {
    case RECEIVE_PLAYERS:
      return action.players;
    case RECEIVE_PLAYER:
      newState = Object.assign({}, state);
      newState[action.id] = action.data;
      return newState;
    case ASSIGN_ROOM:
      newState = Object.assign({}, state);
      newState[action.id] = Object.assign({}, state[action.id], { room: action.data });
      return newState;
    case UPDATE_PLAYER:
      newState = Object.assign({}, state);
      newState[action.id] = Object.assign({}, state[action.id], action.data);
      return newState;
    case CHANGE_PLAYER_SCALE:
      newState = Object.assign({}, state);
      newState[action.id] = Object.assign({}, state[action.id]);
      newState[action.id].scale += action.change;
      return newState;
    case REMOVE_PLAYER:
      newState = Object.assign({}, state);
      delete newState[action.id];
      return newState;
    default:
      return state;
  }
};


const mutable = (state = initialState, action) => {
  switch (action.type) {
    case RECEIVE_PLAYERS:
      return action.players;
    case RECEIVE_PLAYER:
      state[action.id] = action.data;
      return state;
    case ASSIGN_ROOM:
      state[action.id].room = action.room;
      return state;
    case UPDATE_PLAYER:
      Object.assign(state[action.id], action.data);
      return state;
    case CHANGE_PLAYER_SCALE:
      state[action.id].scale += action.change;
      return state;
    case REMOVE_PLAYER:
      delete state[action.id];
      return state;
    default:
      return state;
  }
};

const chooseReducer = reducerMode => {
  switch (reducerMode) {
    case 'mutable': return mutable;
    case 'immutable': return immutable;
    default: return mutable;
  }
};

module.exports.reducer =  chooseReducer('immutable');
