import { Food } from './game/food';
import { forOwn } from 'lodash';

/*----------  INITIAL STATE  ----------*/
const initialState = {};

/*----------  ACTION TYPES  ----------*/
const RECEIVE_MULTIPLE_FOOD = 'RECEIVE_MULTIPLE_FOOD';
const RECEIVE_SINGLE_FOOD = 'RECEIVE_SINGLE_FOOD';
const UPDATE_FOOD = 'UPDATE_FOOD';
const REMOVE_FOOD = 'REMOVE_FOOD';

/*----------  ACTION CREATORS  ----------*/
export const receiveMultipleFood = foodData => ({
  type: RECEIVE_MULTIPLE_FOOD,
  foodData
});

export const receiveSingleFood = (id, data) => ({
  type: RECEIVE_SINGLE_FOOD,
  id,
  data
});

export const updatePlayer = (id, data) => ({
  type: UPDATE_FOOD,
  id,
  data
});

export const removeFood = id => ({
  type: REMOVE_FOOD,
  id
});


/*----------  THUNK CREATORS  ----------*/
export const addMultipleFoodToScene = foodData => dispatch => {
  let food;
  dispatch(receiveMultipleFood(foodData));
  forOwn(foodData, (data, id) => {
    food = new Food(id, data);
    food.init();
  });
};

export const addSingleFoodToScene = (id, data) => dispatch => {
  dispatch(receiveSingleFood(id, data));
  let food = new Food(id, data);
  food.init();
};

export const removeFoodFromScene = (id, scene) => dispatch => {
  dispatch(removeFood(id));
  scene.remove(id);
};

/*----------  REDUCER  ----------*/
export default (state = initialState, action) => {
  let food;
  switch (action.type) {
    case RECEIVE_MULTIPLE_FOOD:
      return action.foodData;
    case RECEIVE_SINGLE_FOOD:
      state[action.id] = action.data;
      return state;
    case REMOVE_FOOD:
      delete state[action.id];
      return state;
    case UPDATE_FOOD:
      food = state[action.id];
      Object.assign(food, action.data);
      return state;
    default: return state;
  }
};
