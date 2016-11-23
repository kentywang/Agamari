let newState;

/*----------  INITIAL STATE  ----------*/
const initialState = {};

/*----------  ACTION TYPES  ----------*/
const RECEIVE_ALL_FOOD = 'RECEIVE_ALL_FOOD';
const RECEIVE_FOOD = 'RECEIVE_FOOD';
const RECEIVE_MULTIPLE_FOOD = 'RECEIVE_MULTIPLE_FOOD';
const REMOVE_FOOD = 'REMOVE_FOOD';


/*----------  ACTION CREATORS  ----------*/
module.exports.receiveAllFood = food => ({
  type: RECEIVE_ALL_FOOD,
  food
});

module.exports.receiveFood = (id, data) => ({
  type: RECEIVE_FOOD,
  id,
  data
});

module.exports.receiveMultipleFood = food => ({
  type: RECEIVE_MULTIPLE_FOOD,
  food
});

module.exports.removeFood = id => ({
  type: REMOVE_FOOD,
  id
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

module.exports.reducer = chooseReducer('immutable');
