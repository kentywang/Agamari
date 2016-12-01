let newState;

/*----------  INITIAL STATE  ----------*/
const initialState = {};

/*----------  ACTION TYPES  ----------*/
const RECEIVE_FOOD = 'RECEIVE_FOOD';
const RECEIVE_MULTIPLE_FOOD = 'RECEIVE_MULTIPLE_FOOD';
const REMOVE_FOOD = 'REMOVE_FOOD';
const REMOVE_ALL_FOOD = 'REMOVE_ALL_FOOD';


/*----------  ACTION CREATORS  ----------*/
export const receiveFood = (id, data) => ({
  type: RECEIVE_FOOD,
  id,
  data
});

export const receiveMultipleFood = food => ({
  type: RECEIVE_MULTIPLE_FOOD,
  food
});

export const removeFood = id => ({
  type: REMOVE_FOOD,
  id
});

export const removeAllFood = () => ({
  type: REMOVE_ALL_FOOD
});


/*----------  THUNK CREATORS  ----------*/

/*----------  REDUCER  ----------*/
const immutable = (state = initialState, action) => {
  switch (action.type) {
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
    case REMOVE_ALL_FOOD:
      return initialState;
    default: return state;
  }
};


const semimutable = (state = initialState, action) => {
  switch (action.type) {
    case RECEIVE_FOOD:
      newState = Object.assign({}, state);
      newState[action.id] = action.data;
      return newState;
    case RECEIVE_MULTIPLE_FOOD:
      newState = Object.assign({}, state);
      Object.assign(newState, action.food);
      return newState;
    case REMOVE_FOOD:
      newState = Object.assign({}, state);
      delete newState[action.id];
      return newState;
    default: return state;
  }
};


const mutable = (state = initialState, action) => {
  switch (action.type) {
    case RECEIVE_FOOD:
      state[action.id] = action.data;
      return state;
    case RECEIVE_MULTIPLE_FOOD:
      Object.assign(state, action.food);
      return state;
    case REMOVE_FOOD:
      delete state[action.id];
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

export default chooseReducer('immutable');
