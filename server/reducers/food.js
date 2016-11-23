let { reducerMode } = require('../constants');
let newState;

/*----------  INITIAL STATE  ----------*/
const initialState = {
  room1: {}
};

/*----------  ACTION TYPES  ----------*/
const ADD_ROOM = 'ADD_ROOM';
const RECEIVE_FOOD = 'RECEIVE_FOOD';
const RECEIVE_MULTIPLE_FOOD = 'RECEIVE_MULTIPLE_FOOD';
const REMOVE_FOOD = 'REMOVE_FOOD';


/*----------  ACTION CREATORS  ----------*/
module.exports.addRoom = name => ({
  type: ADD_ROOM,
  name
});

module.exports.receiveFood = (room, id, data) => ({
  type: RECEIVE_FOOD,
  room, id, data
});

module.exports.receiveMultipleFood = (room, food) => ({
  type: RECEIVE_MULTIPLE_FOOD,
  room, food
});

module.exports.removeFood = (room, id) => ({
  type: REMOVE_FOOD,
  room, id
});


/*----------  THUNK CREATORS  ----------*/


/*----------  REDUCER  ----------*/
const immutable = (state = initialState, action) => {
  switch (action.type) {
    case ADD_ROOM:
      newState = Object.assign({}, state);
      newState[action.name] = {};
      return newState;
    case RECEIVE_FOOD:
      newState = Object.assign({}, state);
      newState[action.room] = Object.assign({}, newState[action.room]);
      newState[action.room][action.id] = action.data;
      return newState;
    case RECEIVE_MULTIPLE_FOOD:
      newState = Object.assign({}, state);
      newState[action.room] = Object.assign({}, newState[action.room], action.food);
      return newState;
    case REMOVE_FOOD:
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
    case RECEIVE_FOOD:
      newState = Object.assign({}, state);
      newState[action.room][action.id] = action.data;
      return newState;
    case RECEIVE_MULTIPLE_FOOD:
      newState = Object.assign({}, state);
      Object.assign(newState[action.room], action.food);
      return newState;
    case REMOVE_FOOD:
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
      return newState;
    case RECEIVE_FOOD:
      state[action.room][action.id] = action.data;
      return state;
    case RECEIVE_MULTIPLE_FOOD:
      Object.assign(state[action.room], action.food);
      return state;
    case REMOVE_FOOD:
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

module.exports.reducer = chooseReducer(reducerMode);
