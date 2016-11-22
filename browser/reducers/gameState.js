import {removeFood} from '../game/food';

/*----------  INITIAL STATE  ----------*/
const initialState = {};

/*----------  ACTION TYPES  ----------*/
const RECEIVE_GAMESTATE = 'RECEIVE_GAMESTATE';
const UPDATE_COLOR = 'UPDATE_COLOR';
const ADD_PLAYER = 'ADD_PLAYER';
const UPDATE_LOCATION = 'UPDATE_LOCATION';
const ADD_FOOD_POINTER = 'ADD_FOOD_POINTER';
const REMOVE_PLAYER = 'REMOVE_PLAYER';
const REMOVE_FOOD_AND_ADD_MASS = 'REMOVE_FOOD_AND_ADD_MASS';

/*----------  ACTION CREATORS  ----------*/
export const receiveGameState = state => ({
  type: RECEIVE_GAMESTATE,
  state
});

export const updateColor = color => ({
  type: UPDATE_COLOR,
  color
});

export const addPlayer = (id, data) => ({
  type: ADD_PLAYER,
  id,
  data
});

export const removePlayer = id => ({
  type: REMOVE_PLAYER,
  id
});

export const addFoodPointer = (index, mesh, cannonMesh) => ({
  type: ADD_FOOD_POINTER,
  index,
  mesh,
  cannonMesh
});

export const removeFoodAndAddMass = (id, index) => ({
  type: REMOVE_FOOD_AND_ADD_MASS,
  id,
  index
});

export const updateLocation = (id, data) => ({
  type: UPDATE_LOCATION,
  id,
  data
});

/*----------  THUNK CREATORS  ----------*/

/*----------  REDUCER  ----------*/
export default (state = initialState, action) => {
let newState, players;
  switch (action.type) {
    case RECEIVE_GAMESTATE:

      return action.state//Object.assign(state, action.state);
    case UPDATE_COLOR:
      state.color = action.color;
      return state;
    case ADD_PLAYER:
      state.players[action.id] = action.data;
      return state;
    case ADD_FOOD_POINTER:
      state.food[action.index].mesh = action.mesh;
      state.food[action.index].cannonMesh = action.cannonMesh;
      //console.log("add food pointer", state);
      return state//Object.assign({}, state);
    case REMOVE_PLAYER:
    // WE NEED To still remove the player from scene 
      delete state.players[action.id];
      return state;
    case REMOVE_FOOD_AND_ADD_MASS:
      // don't need to add mass if coming from other players since it'll be updated in anim loop
      //console.log("in reducer")
      if(action.id) state.players[action.id].scale += 0.1;
      removeFood(action.index); // should do this in thunk
      state.food.splice(action.index, 1)
      return state;
    case UPDATE_LOCATION:
      state.players[action.id] = action.data;
      return state;
    default: return state;
  }
};
