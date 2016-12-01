let newState;

/*----------  INITIAL STATE  ----------*/
const initialState = {eatenCooldown: 0};

/*----------  ACTION TYPES  ----------*/
const RECEIVE_PLAYERS = 'RECEIVE_PLAYERS';
const RECEIVE_PLAYER = 'RECEIVE_PLAYER';
const ASSIGN_ROOM = 'ASSIGN_ROOM';
const UPDATE_PLAYER = 'UPDATE_PLAYER';
const CHANGE_PLAYER_SCALE = 'CHANGE_PLAYER_SCALE';
const REMOVE_PLAYER = 'REMOVE_PLAYER';
const UPDATE_VOLUME = 'UPDATE_VOLUME';
const ADD_FOOD_TO_DIET = 'ADD_FOOD_TO_DIET';
const ADD_PLAYER_TO_DIET = 'ADD_PLAYER_TO_DIET';
const CLEAR_DIET = 'CLEAR_DIET';
const AFK = "AFK";
const UNAFK = "UNAFK";

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

module.exports.updateVolume = (id, volume) => ({
  type: UPDATE_VOLUME,
  id,
  volume
});

module.exports.addFoodToDiet = (food, id, data) => ({
  type: ADD_FOOD_TO_DIET,
  food,
  id,
  data
});

module.exports.addPlayerToDiet = (food, id, data) => ({
  type: ADD_PLAYER_TO_DIET,
  food,
  id,
  data
});

module.exports.clearDiet = id => ({
  type: CLEAR_DIET,
  id,
});

module.exports.afk = id => ({
  type: AFK,
  id,
});

module.exports.unAfk = id => ({
  type: UNAFK,
  id,
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
    case UPDATE_VOLUME:
      newState = Object.assign({}, state);
      newState[action.id] = Object.assign({}, state[action.id]);
      newState[action.id].volume = ~~action.volume; // this is math.floor of volume
      return newState;
    case ADD_FOOD_TO_DIET:
      newState = Object.assign({}, state);
      newState[action.id] = Object.assign({}, state[action.id]);
        if(!newState[action.id].diet){
          newState[action.id].diet = [];
        }
      newState[action.id].diet.push({food: action.food, x: action.data.x, y: action.data.y, z: action.data.z, qx: action.data.qx, qy: action.data.qy, qz: action.data.qz, qw: action.data.qw, scale: action.data.scale}); // when I do playerData: action.data, I get max call stack. Why?
      return newState;
    case ADD_PLAYER_TO_DIET:
      newState = Object.assign({}, state);
      newState[action.id] = Object.assign({}, state[action.id]);
        if(!newState[action.id].diet){
          newState[action.id].diet = [];
        }
      newState[action.id].diet.push({eatenPlayer: action.food, x: action.data.x, y: action.data.y, z: action.data.z, qx: action.data.qx, qy: action.data.qy, qz: action.data.qz, qw: action.data.qw, scale: action.data.scale}); // when I do playerData: action.data, I get max call stack. Why?
      return newState;
    case CLEAR_DIET:
      newState = Object.assign({}, state);
      newState[action.id].diet = [];
      newState[action.id].eatenCooldown = Date.now();
      return newState;
    case AFK: // figure out why sometimes newState[action.id] is undefined, then remove the if statement
      newState = Object.assign({}, state);
      if(newState[action.id]){
        newState[action.id].afk = true;
      }
      return newState;
    case UNAFK: // figure out why sometimes newState[action.id] is undefined, then remove the if statement
      newState = Object.assign({}, state);
      if(newState[action.id]){
        newState[action.id].afk = false;
      }
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
    case UPDATE_VOLUME:
      state[action.id].volume = ~~action.volume;
      return state;
// no ADD_FOOD_TO_DIET, nor ADD_PLAYER_To_DIET cases mutable implemented yet
    case CLEAR_DIET:
      state[action.id].diet = [];
      state[action.id].eatenCooldown = Date.now();
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
