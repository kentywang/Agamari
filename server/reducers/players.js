let newState;

/*----------  INITIAL STATE  ----------*/
const initialState = {};

/*----------  ACTION TYPES  ----------*/
const RECEIVE_PLAYERS = 'RECEIVE_PLAYERS';
const RECEIVE_PLAYER = 'RECEIVE_PLAYER';
const ASSIGN_WORLD = 'ASSIGN_WORLD';
const UPDATE_PLAYER = 'UPDATE_PLAYER';
const CHANGE_PLAYER_SCALE = 'CHANGE_PLAYER_SCALE';
const REMOVE_PLAYER = 'REMOVE_PLAYER';
const UPDATE_VOLUME = 'UPDATE_VOLUME';
const INCREMENT_FOOD_EATEN = 'INCREMENT_FOOD_EATEN';
const CLEAR_FOOD_EATEN = 'CLEAR_FOOD_EATEN';
const INCREMENT_PLAYERS_EATEN = 'INCREMENT_PLAYERS_EATEN';
const CLEAR_PLAYERS_EATEN = 'CLEAR_PLAYERS_EATEN';
const ADD_FOOD_TO_DIET = 'ADD_FOOD_TO_DIET';
const ADD_PLAYER_TO_DIET = 'ADD_PLAYER_TO_DIET';
const CLEAR_DIET = 'CLEAR_DIET';

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

module.exports.assignWorld = (id, world) => ({
  type: ASSIGN_WORLD,
  id,
  world
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

module.exports.incrementFoodEaten = id => ({
  type: INCREMENT_FOOD_EATEN,
  id
});

module.exports.clearFoodEaten = id => ({
  type: CLEAR_FOOD_EATEN,
  id
});

module.exports.incrementPlayersEaten = id => ({
  type: INCREMENT_PLAYERS_EATEN,
  id
});

module.exports.clearPlayersEaten = id => ({
  type: CLEAR_PLAYERS_EATEN,
  id
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
    case ASSIGN_WORLD:
      newState = Object.assign({}, state);
      newState[action.id] = Object.assign({}, state[action.id], { world: action.world });
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
      newState[action.id].volume = ~~action.volume;
      return newState;
    case INCREMENT_FOOD_EATEN:
      newState = Object.assign({}, state);
      newState[action.id] = Object.assign({}, state[action.id]);
      newState[action.id].foodEaten += 1;
      return newState;
    case CLEAR_FOOD_EATEN:
       newState = Object.assign({}, state);
      newState[action.id] = Object.assign({}, state[action.id]);
      newState[action.id].foodEaten = 0;
      return newState;
    case INCREMENT_PLAYERS_EATEN:
      newState = Object.assign({}, state);
      newState[action.id] = Object.assign({}, state[action.id]);
      newState[action.id].playersEaten += 1;
      return newState;
    case CLEAR_PLAYERS_EATEN:
       newState = Object.assign({}, state);
      newState[action.id] = Object.assign({}, state[action.id]);
      newState[action.id].playersEaten = 0;
      return newState;
    case ADD_FOOD_TO_DIET:
      newState = Object.assign({}, state);
      newState[action.id] = Object.assign({}, state[action.id]);
        if (!newState[action.id].diet){
          newState[action.id].diet = [];
        }
      newState[action.id].diet.push({food: action.food, x: action.data.x, y: action.data.y, z: action.data.z, qx: action.data.qx, qy: action.data.qy, qz: action.data.qz, qw: action.data.qw, scale: action.data.scale}); // when I do playerData: action.data, I get max call stack. Why?
      return newState;
    case ADD_PLAYER_TO_DIET:
      newState = Object.assign({}, state);
      newState[action.id] = Object.assign({}, state[action.id]);
        if (!newState[action.id].diet){
          newState[action.id].diet = [];
        }
      newState[action.id].diet.push({eatenPlayer: action.food, x: action.data.x, y: action.data.y, z: action.data.z, qx: action.data.qx, qy: action.data.qy, qz: action.data.qz, qw: action.data.qw, scale: action.data.scale}); // when I do playerData: action.data, I get max call stack. Why?
      return newState;
    case CLEAR_DIET:
      newState = Object.assign({}, state);
      newState[action.id].diet = [];
      newState[action.id].eatenCooldown = Date.now();
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
    case ASSIGN_WORLD:
      state[action.id].world = action.world;
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
