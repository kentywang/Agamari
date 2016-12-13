const { pickBy } = require('lodash');
let newState;

/*----------  INITIAL STATE  ----------*/
const initialState = {};

/*----------  ACTION TYPES  ----------*/
const RECEIVE_ALL_FOOD = 'RECEIVE_ALL_FOOD';
const RECEIVE_FOOD = 'RECEIVE_FOOD';
const RECEIVE_MULTIPLE_FOOD = 'RECEIVE_MULTIPLE_FOOD';
const REMOVE_FOOD = 'REMOVE_FOOD';
const REMOVE_MULTIPLE_FOOD = 'REMOVE_MULTIPLE_FOOD';


/*----------  ACTION CREATORS  ----------*/
const receiveAllFood = food => ({
  type: RECEIVE_ALL_FOOD,
  food
});

const receiveFood = (id, data) => ({
  type: RECEIVE_FOOD,
  id,
  data
});

const receiveMultipleFood = food => ({
  type: RECEIVE_MULTIPLE_FOOD,
  food
});

const removeFood = id => ({
  type: REMOVE_FOOD,
  id
});

const removeMultipleFood = food => ({
  type: REMOVE_MULTIPLE_FOOD,
  food
});


/*----------  THUNK CREATORS  ----------*/


/*----------  REDUCER  ----------*/
const immutable = (state = initialState, action) => {
  switch (action.type) {
    case RECEIVE_ALL_FOOD:
      return action.food;
    case RECEIVE_FOOD:
      newState = Object.assign({}, state);
      newState[action.id] = action.data;
      return newState;
    case RECEIVE_MULTIPLE_FOOD:
      newState = Object.assign({}, state, action.food);
      return newState;
    case REMOVE_FOOD:
      newState = Object.assign({}, state);
      delete newState[action.id];
      return newState;
    case REMOVE_MULTIPLE_FOOD:
      newState = Object.assign({}, state);
      return pickBy(newState, (food, id) => !action.food[id]);
    default:
      return state;
  }
};

const mutable = (state = initialState, action) => {
  switch (action.type) {
    case RECEIVE_ALL_FOOD:
      return action.food;
    case RECEIVE_FOOD:
      state[action.id] = action.data;
      return state;
    case RECEIVE_MULTIPLE_FOOD:
      return Object.assign(state, action.food);
    case REMOVE_FOOD:
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

const reducer = chooseReducer('immutable');

module.exports = {
  reducer,
  receiveAllFood,
  receiveFood,
  receiveMultipleFood,
  removeFood,
  removeMultipleFood
};
